import React, {useEffect} from 'react';
import OneSignal, {
  NotificationReceivedEvent,
  OpenedEvent,
} from 'react-native-onesignal';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import {useAppDispatch} from './hooks';
import {ONESIGNAL_APP_ID} from './env';
import {
  handleReceivedNotification,
  handleOpenedNotification,
} from './lib/notification';
import {saveOnesignalId} from './slices/user';
import {usePermissions} from './components/PermissionsHelper';
import {useToken} from './lib/TokenHelper';
import {MatchesStackParamList} from './navigation/NavigatorTypes';

export default ({children}: {children: React.ReactElement}) => {
  const navigation = useNavigation<NavigationProp<MatchesStackParamList>>();
  const dispatch = useAppDispatch();
  const {notificationPermission} = usePermissions();
  const {token: token} = useToken();

  const getOneSignalId = async () => {
    const device = await OneSignal.getDeviceState();

    if (token && device && device.hasNotificationPermission) {
      await dispatch(saveOnesignalId(device));
    }
  };

  const onReceived = (notification: NotificationReceivedEvent) => {
    handleReceivedNotification(notification);
  };

  const onOpened = async (openResult: OpenedEvent) => {
    await handleOpenedNotification(
      openResult.notification,
      navigation,
      dispatch,
    );
  };

  useEffect(() => {
    OneSignal.setAppId(ONESIGNAL_APP_ID);

    OneSignal.setNotificationWillShowInForegroundHandler(onReceived);
    OneSignal.setNotificationOpenedHandler(onOpened);
    return () => {
      OneSignal.clearHandlers();
    };
  }, []);

  useEffect(() => {
    getOneSignalId();
  }, [notificationPermission, token]);

  return <>{children}</>;
};
