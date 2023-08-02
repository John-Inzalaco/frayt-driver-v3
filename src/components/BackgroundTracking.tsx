import React, {useState} from 'react';
import BackgroundGeolocation, {
  Location,
  Subscription,
} from 'react-native-background-geolocation-android';
import {AppState, Platform} from 'react-native';
import {usePermissions} from './PermissionsHelper';
import {updateDriverLocation} from '../slices/user';
import {Match} from '@frayt/sdk';
import {useToken} from '../lib/TokenHelper';
import {useInterval} from '@frayt/react-interval-hook';
import {useAppDispatch} from '../hooks';
import {useSelector} from 'react-redux';
import {selectAcceptedMatches} from '../slices/matches';
import moment from 'moment';

const Accuracy = {
  EN_ROUTE: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
  ACTIVE: BackgroundGeolocation.DESIRED_ACCURACY_LOW,
  INACTIVE: BackgroundGeolocation.DESIRED_ACCURACY_VERY_LOW,
};

enum DistanceFilter {
  EN_ROUTE = 10,
  ACTIVE = 250,
  INACTIVE = 2000,
}

export enum DriverTrackingStatus {
  EN_ROUTE = 'EN_ROUTE',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

enum MinIntervalInSeconds {
  EN_ROUTE = 30,
  ACTIVE = 6 * 60,
  INACTIVE = 30 * 60,
}

/**
 * When the app launches, this will start the background tracking
 * If they aren't logged in or have insufficient permissions, the task will not start
 * until the user logs in and has sufficient permissions for location services.
 */
export const BackgroundTracking = () => {
  const {checkLocation} = usePermissions();
  const acceptedMatches: Match[] = useSelector(selectAcceptedMatches);
  const {token: token} = useToken();
  const dispatch = useAppDispatch();

  const {stop} = useInterval(async () => {
    if (AppState.currentState === 'active') {
      const isTracking = await startTracking();
      if (isTracking) stop();
    }
  }, 10000);

  const [lastUpdateTimestamp, setLastUpdateTimestamp] =
    useState<moment.Moment | null>();

  const startTracking = async () => {
    if (!token) {
      console.log(
        'User is not logged in, not starting the background task yet',
      );
      return;
    }
    const [locationResult, backgroundResult] = await checkLocation();

    if (locationResult !== 'granted')
      return console.log('User has insufficient location services permission');

    if (backgroundResult !== 'granted') {
      if (AppState.currentState === 'active') {
        BackgroundGeolocation.getCurrentPosition({desiredAccuracy: 10});

        if (
          Platform.OS === 'ios' &&
          parseInt(Platform.Version.toString(), 10) > 13
        ) {
          console.log(
            'User has insufficient background location permission, but accessed GPS in the foreground and will start background task for their device to ask for Allows Allow permissions later.',
          );
        } else {
          return console.log(
            'User has insufficient background location permission and cannot start background task, but accessed GPS in the foreground',
          );
        }
      } else {
        return console.log(
          'User has insufficient background location permission and cannot start background task',
        );
      }
    }

    if (locationResult === 'granted' && backgroundResult === 'granted') {
      return BackgroundGeolocation.start()
        .then(async () => {
          enable_android_location_testing();

          return true;
        })
        .catch(error => {
          console.info(error);
          return false;
        });
    }

    return false;
  };

  React.useEffect(() => {
    BackgroundGeolocation.ready({
      locationAuthorizationRequest: 'Always',
      backgroundPermissionRationale: {
        title: "Allow access to this device's location in the background?",
        message:
          "Please enable 'Allow all the time' permission in the settings screen. This will allow FRAYT to use your location for ETAs during deliveries.",
        positiveAction: 'Open Settings',
      },
    }).then(() => {
      console.info('BackgroundGeolocation is configured and ready');
    });
  }, []);

  React.useEffect(() => {
    maybeUpdateBackgroundGeolocationConfigs();
  }, [acceptedMatches]);

  React.useEffect(() => {
    const onLocation: Subscription = BackgroundGeolocation.onLocation(
      location => {
        if (!location.sample && location.coords) {
          // Immediately update server location for adhoc location updates
          // Otherwise only update server location based on our defined sampling intervals
          if (location?.extras?.requestType == 'adhoc') {
            performUpdateDriverLocation(location);
          } else {
            const trackingStatus = getDriverTrackingStatus(acceptedMatches);

            const delay = MinIntervalInSeconds[trackingStatus];

            let currentTimeIsGreaterThanDelay;

            if (!lastUpdateTimestamp) {
              currentTimeIsGreaterThanDelay = true;
            } else {
              currentTimeIsGreaterThanDelay = lastUpdateTimestamp.isBefore(
                moment.utc().subtract(delay, 'seconds'),
              );
            }

            if (currentTimeIsGreaterThanDelay) {
              performUpdateDriverLocation(location);
              setLastUpdateTimestamp(moment.utc());
            }
          }
        }
      },
    );

    return () => {
      // Remove BackgroundGeolocation event-subscribers when the View is removed or refreshed
      // during development live-reload.  Without this, event-listeners will accumulate with
      // each refresh during live-reload.
      onLocation.remove();
    };
  }, [lastUpdateTimestamp, acceptedMatches]);

  const performUpdateDriverLocation = (location: Location) => {
    console.log(
      `Retrieved GPS coordinates in ${
        AppState.currentState === 'active' ? 'foreground' : 'background'
      }, lat: ${location.coords.latitude} - lng: ${location.coords.longitude}`,
    );

    if (token) {
      dispatch(
        updateDriverLocation({
          location: location.coords,
          token: token,
        }),
      );
    }
  };

  const getDriverTrackingStatus = (_: Match[]): DriverTrackingStatus => {
    const isEnRoute = acceptedMatches.some(match => match.isEnRoute());
    const isActive = acceptedMatches.some(match => match.isLive());

    if (isEnRoute) {
      return DriverTrackingStatus.EN_ROUTE;
    } else if (isActive) {
      return DriverTrackingStatus.ACTIVE;
    } else {
      return DriverTrackingStatus.INACTIVE;
    }
  };

  const maybeUpdateBackgroundGeolocationConfigs = async () => {
    const driverTrackingStatus = getDriverTrackingStatus(acceptedMatches);

    const config = {
      distanceFilter: DistanceFilter[driverTrackingStatus],
      desiredAccuracy: Accuracy[driverTrackingStatus],
    };

    try {
      await BackgroundGeolocation.setConfig(config);
    } catch (error) {
      console.info(error);
    }
  };

  const enable_android_location_testing = async () => {
    // Enables testing on Android simulator
    // https://github.com/transistorsoft/flutter_background_geolocation/issues/448
    if (__DEV__ && Platform.OS === 'android') {
      const state = await BackgroundGeolocation.getState();

      if (state.enabled && !state.isMoving) {
        BackgroundGeolocation.changePace(true);
      }
    }
  };

  return <></>;
};
