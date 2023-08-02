import {useInterval} from '@frayt/react-interval-hook';
import {useState} from 'react';
import {Platform, Rationale} from 'react-native';
import {requestNotifications} from 'react-native-permissions';
import {
  check,
  checkNotifications,
  PERMISSIONS,
  request,
  type PermissionStatus,
} from 'react-native-permissions';

import BackgroundGeolocation from 'react-native-background-geolocation-android';

export function usePermissions() {
  const [cameraPermission, setCameraPermission] =
    useState<PermissionStatus | null>(null);
  const [activityPermission, setActivityPermission] =
    useState<PermissionStatus | null>();
  const [locationPermissions, setLocationPermission] = useState<
    [PermissionStatus, PermissionStatus] | null
  >(null);
  const [notificationPermission, setNotificationPermission] =
    useState<PermissionStatus | null>(null);

  useInterval(
    () => {
      checkAll();
    },
    10000,
    {immediate: true, autoStart: true},
  );

  async function checkAll() {
    try {
      await checkCamera();
      await checkLocation();
      await checkNotification();
    } catch (e) {
      console.warn(e);
    }
  }

  async function checkActivity(): Promise<PermissionStatus> {
    if (Platform.OS === 'android') {
      const result = await check(PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION);
      setActivityPermission(result);
      return result;
    } else {
      const result = await check(PERMISSIONS.IOS.MOTION);
      setActivityPermission(result);
      return result;
    }
  }

  /**
   * Immediately updates {@link locationPermission} asynchronously.
   * Shouldn't need to be used directly since the usePermissions hook
   * updates permissions immediately upon mount, then every 10 seconds.
   */
  async function checkLocation(): Promise<
    [PermissionStatus, PermissionStatus]
  > {
    if (Platform.OS === 'ios') {
      const locationResult = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      const backgroundResult = await check(PERMISSIONS.IOS.LOCATION_ALWAYS);
      setLocationPermission([locationResult, backgroundResult]);
      return [locationResult, backgroundResult];
    } else {
      const locationResult = await check(
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      );

      const backgroundResult = await check(
        PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
      );
      setLocationPermission([locationResult, backgroundResult]);
      return [locationResult, backgroundResult];
    }
  }

  /**
   * Immediately updates {@link cameraPermission} asynchronously.
   * Shouldn't need to be used directly since the usePermissions hook
   * updates permissions immediately upon mount, then every 10 seconds.
   */
  async function checkCamera(): Promise<PermissionStatus> {
    if (Platform.OS === 'ios') {
      const result = await check(PERMISSIONS.IOS.CAMERA);
      setCameraPermission(result);
      return result;
    } else {
      const result = await check(PERMISSIONS.ANDROID.CAMERA);
      setCameraPermission(result);
      return result;
    }
  }

  async function checkNotification(): Promise<PermissionStatus> {
    const {status} = await checkNotifications();
    setNotificationPermission(status);
    return status;
  }

  async function requestNotificationPermission(): Promise<PermissionStatus> {
    const {status} = await requestNotifications(['alert', 'badge', 'sound']);
    setNotificationPermission(status);
    return status;
  }

  /**
   * Immediately requests {@link cameraPermission} asynchronously.
   */
  async function requestCameraPermission(): Promise<PermissionStatus> {
    if (Platform.OS === 'ios') {
      const result = await request(PERMISSIONS.IOS.CAMERA);
      setCameraPermission(result);
      return result;
    } else {
      const result = await request(PERMISSIONS.ANDROID.CAMERA);
      setCameraPermission(result);
      return result;
    }
  }

  async function requestActivityPermission(): Promise<PermissionStatus> {
    let result: PermissionStatus | null = null;
    if (Platform.OS === 'android') {
      result = await request(PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION, {
        title: 'Frayt needs your permission',
        message:
          'Frayt uses motion-detection to determine the motion-activity of the device to provide live tracking for shippers.',
        buttonPositive: 'OK',
      } as Rationale);
    } else {
      result = await request(PERMISSIONS.IOS.MOTION);
    }
    setActivityPermission(result);
    return result;
  }

  /**
   * Immediately requests {@link locationPermission} asynchronously.
   */
  async function requestLocationPermission(): Promise<
    [PermissionStatus, PermissionStatus]
  > {
    try {
      const result = await BackgroundGeolocation.requestPermission();

      // https://transistorsoft.github.io/react-native-background-geolocation-android/index.html#authorizationstatus
      if (result === 3) {
        setLocationPermission(['granted', 'granted']);
        return ['granted', 'granted'];
      }
      setLocationPermission(['granted', 'denied']);
      return ['granted', 'denied'];
    } catch (error) {
      setLocationPermission(['denied', 'denied']);
      return ['denied', 'denied'];
    }
  }

  return {
    cameraPermission,
    checkCamera,
    requestCameraPermission,
    activityPermission,
    locationPermissions,
    checkActivity,
    checkLocation,
    requestActivityPermission,
    requestLocationPermission,
    notificationPermission,
    checkNotification,
    requestNotificationPermission,
  };
}
