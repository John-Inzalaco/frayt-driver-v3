import {Alert} from 'react-native';
import axios from 'axios';
import * as Sentry from '@sentry/react-native';

export const handleError = (error: unknown, title = 'Error') => {
  Sentry.captureException(error);

  if (typeof error === 'string') {
    Alert.alert(title, error);
  } else if (axios.isAxiosError(error)) {
    return Alert.alert(title, error.response?.data.message);
  } else if (error instanceof Error) {
    Alert.alert(title, error.message);
  }
};

export const rejectWithValueError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ERR_NETWORK')
      return new Error(
        'The FRAYT servers are temporarily unavailable. Please check your internet connection and try again later.',
      );
    if (error.response?.status === 500) return new Error(error.message);
    return new Error(error.response?.data.message);
  }
  if (error instanceof Error) {
    return error;
  } else {
    return new Error('Unknown error has occured');
  }
};
