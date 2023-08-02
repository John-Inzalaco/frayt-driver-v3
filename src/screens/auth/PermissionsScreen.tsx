import React, {useEffect, useState} from 'react';
import {Layout, Toggle} from '@ui-kitten/components';
import {Alert, Platform, StyleSheet, View} from 'react-native';
import {AuthStackProps} from '../../navigation/NavigatorTypes';
import {logoutUser} from '../../slices/user';
import {Text} from '../../components/ui-kitten/Text';
import {Button} from '../../components/ui-kitten/Button';
import {DividerGray} from '../../components/ui-kitten/DividerGray';
import {usePermissions} from '../../components/PermissionsHelper';
import {useAppDispatch} from '../../hooks';
import {
  check,
  openSettings,
  PERMISSIONS,
  type PermissionStatus,
} from 'react-native-permissions';
import {useLoginHelper} from '../../lib/LoginHelper';

export default function PermissionsScreen({
  navigation: navigation,
  route: _route,
}: AuthStackProps<'Permissions'>): React.ReactElement {
  const dispatch = useAppDispatch();
  const {
    activityPermission,
    locationPermissions,
    notificationPermission,
    requestActivityPermission,
    requestLocationPermission,
    requestNotificationPermission,
    checkActivity,
    checkLocation,
    checkNotification,
  } = usePermissions();
  const {getAuthRoute} = useLoginHelper();
  const [locationPermission, backgroundPermission]: [
    PermissionStatus,
    PermissionStatus,
  ] = locationPermissions ? locationPermissions : ['denied', 'denied'];

  useEffect(() => {
    checkActivity();
    checkLocation();
    checkNotification();
  }, []);

  const [activityRequestPending, setActivityRequestPending] = useState(false);
  const [locationRequestPending, setlocationRequestPending] = useState(false);
  const [notificationRequestPending, setNotificationRequestPending] =
    useState(false);

  const finish = async () => {
    const {route, screen} = await getAuthRoute();
    if (route === 'Home') return navigation.navigate(route, {screen: screen});
    navigation.navigate(route, {screen: screen});
  };

  const handleLogOut = async () => {
    const {token} = await dispatch(logoutUser()).unwrap();
    if (!token) {
      navigation.replace('Auth', {screen: 'Login'});
    }
  };

  const isMotionPermissionGiven = async (): Promise<boolean> => {
    let result: PermissionStatus = 'unavailable';
    if (Platform.OS === 'android') {
      result = await check(PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION);
    } else {
      result = await check(PERMISSIONS.IOS.MOTION);
    }
    return result === 'granted';
  };

  const enableNotificationToggle = (): boolean => {
    if (Platform.OS === 'ios') return true;
    if (Platform.OS === 'android' && Platform.Version >= 33) return true;
    return false;
  };

  const renderBackgroundLocationRequest = () => {
    let shouldRender = false;
    if (
      locationPermission === 'granted' &&
      backgroundPermission !== 'granted'
    ) {
      shouldRender = true;
    }
    if (locationPermission !== 'granted') shouldRender = true;
    if (!shouldRender) return <></>;

    return (
      <View>
        <Text category="p2" style={styles.contentSpacing}>
          In order to notify you of matches in your area, we require background
          location permissions. Please manually allow location tracking at all
          times
        </Text>
        <Button style={styles.contentSpacing} onPress={openSettings}>
          Open Settings
        </Button>
      </View>
    );
  };

  return (
    <Layout style={styles.container} level="3">
      <Text category="h5" style={styles.header}>
        Permissions
      </Text>
      <Text category="p2">
        Almost done! We just need you to allow permissions for push
        notifications and location services.
      </Text>

      <Layout level="1" style={styles.toggleContainer}>
        <Toggle
          disabled={
            !enableNotificationToggle() || notificationPermission === 'granted'
          }
          onChange={async () => {
            setNotificationRequestPending(true);

            const notificationResult = await requestNotificationPermission();

            if (notificationResult !== 'granted') {
              Alert.alert(
                'Frayt needs notifications turned on to work properly',
                'Enable notifications in settings',
                [
                  {
                    text: 'Open settings',
                    onPress: () => {
                      openSettings();
                      setNotificationRequestPending(false);
                    },
                  },
                ],
              );
            } else {
              setNotificationRequestPending(false);
            }
          }}
          checked={
            notificationRequestPending || notificationPermission === 'granted'
          }>
          {evaProps => (
            <Text category="c2" {...evaProps}>
              Enable Push Notifications
            </Text>
          )}
        </Toggle>
      </Layout>
      {
        // request motion tracking/activity toggle
      }
      {activityPermission !== 'unavailable' && (
        <Layout level="1" style={styles.toggleContainer}>
          <Toggle
            disabled={activityPermission === 'granted'}
            onChange={async () => {
              setActivityRequestPending(true);

              if (await isMotionPermissionGiven()) {
                Alert.alert(
                  'FRAYT already has permission',
                  'Motion Tracking permission already given.',
                );
              }
              await requestActivityPermission();

              setActivityRequestPending(false);
            }}
            checked={
              activityPermission === 'granted' || activityRequestPending
            }>
            {evaProps => (
              <Text category="c2" {...evaProps}>
                Enable Motion Tracking
              </Text>
            )}
          </Toggle>
        </Layout>
      )}
      {
        // request location tracking toggle
      }
      <Layout level="1" style={styles.toggleContainer}>
        <Toggle
          disabled={locationPermission === 'granted'}
          onChange={async () => {
            setlocationRequestPending(true);

            await requestLocationPermission();

            setlocationRequestPending(false);
          }}
          checked={locationPermission === 'granted' || locationRequestPending}>
          {evaProps => (
            <Text category="c2" {...evaProps}>
              Enable Location Services
            </Text>
          )}
        </Toggle>
      </Layout>

      {renderBackgroundLocationRequest()}

      <Button
        style={styles.contentSpacing}
        disabled={
          locationPermission !== 'granted' ||
          backgroundPermission !== 'granted' ||
          notificationPermission !== 'granted' ||
          (activityPermission !== 'granted' &&
            activityPermission !== 'unavailable')
        }
        onPress={finish}>
        Finish
      </Button>
      <DividerGray style={styles.contentSpacing} />
      <Button
        status="danger"
        style={styles.contentSpacing}
        onPress={handleLogOut}>
        Sign Out
      </Button>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {alignSelf: 'center'},
  toggleContainer: {
    paddingVertical: 10,
    marginTop: 15,
    paddingLeft: 8,
    alignItems: 'flex-start',
    borderRadius: 4,
  },
  contentSpacing: {marginTop: 15},
});
