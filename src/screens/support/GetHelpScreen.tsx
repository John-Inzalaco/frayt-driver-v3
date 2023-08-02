import React from 'react';
import WebView from 'react-native-webview';

export const GetHelpScreen = (): React.ReactElement => {
  return <WebView source={{uri: 'https://www.frayt.com'}}></WebView>;
};
