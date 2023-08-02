import {LOCAL_BASE_URL_ANDROID, LOCAL_BASE_URL_IOS} from '@env';
import {Platform} from 'react-native';

const LOCAL_BASE_URL =
  Platform.OS === 'android' ? LOCAL_BASE_URL_ANDROID : LOCAL_BASE_URL_IOS;

export const BASE_URL = __DEV__ ? LOCAL_BASE_URL : LOCAL_BASE_URL;
