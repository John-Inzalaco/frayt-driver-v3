import {NavigationProp} from '@react-navigation/native';
import {
  NotificationReceivedEvent,
  OSNotification,
} from 'react-native-onesignal';
import {MatchesStackParamList} from '../navigation/NavigatorTypes';
import {getMatchAction} from '../slices/matches';
import {AppDispatch} from '../store';
import {Match} from '@frayt/sdk';

export const notificationType = {
  MATCH: 'MATCH',
  MESSAGE: 'MESSAGE',
  SCHEDULE: 'SCHEDULE',
  BATCH: 'BATCH',
};

type FraytNotificationData = {
  match_id?: string;
  schedule_id?: string;
  delivery_batch_id?: string;
  message?: string;
};

export const getData = (notification: OSNotification) => {
  if (!notification.additionalData) return null;
  return notification.additionalData as FraytNotificationData;
};

export async function handleOpenedNotification(
  notification: OSNotification,
  navigation: NavigationProp<MatchesStackParamList>,
  dispatch: AppDispatch,
) {
  const data = getData(notification);

  const matchId = data?.match_id;
  if (matchId) {
    const match = await dispatch(getMatchAction({matchId})).unwrap();
    navigation.navigate(new Match(match).isLive() ? 'Accepted' : 'Available', {
      matchId,
    });
  }
}

export function handleReceivedNotification(
  notification: NotificationReceivedEvent,
) {
  const nativeNotification = notification.getNotification();
  notification.complete(nativeNotification);
}

export function getNotificationType(notification: OSNotification) {
  const data = getData(notification);
  let type = null;

  if (data) {
    if (data.match_id) {
      type = notificationType.MATCH;
    } else if (data.schedule_id) {
      type = notificationType.SCHEDULE;
    } else if (data.delivery_batch_id) {
      type = notificationType.BATCH;
    } else if (data.message) {
      type = notificationType.MESSAGE;
    }
  }

  return type;
}
