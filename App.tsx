import React, {useEffect} from 'react';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {persistStore} from 'redux-persist';
import codePush from 'react-native-code-push';
import {NetworkProvider} from 'react-native-offline';
import {init} from '@frayt/sdk';
import {store} from './src/store';
import {BASE_URL} from './src/env';
import AppRoot from './src/AppRoot';
import * as Sentry from '@sentry/react-native';
import FullStory from '@fullstory/react-native';

Sentry.init({
  dsn: 'https://fd324ad5c06f416bb02ab7dd52e86800@o310795.ingest.sentry.io/1777326',
  // Recommended to adjust this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 0.5,
  environment: __DEV__ ? 'develop' : 'production',
});

init(BASE_URL);

const persistor = persistStore(store);

const AppComponent = (): React.ReactElement => {
  useEffect(() => {
    const setFullstorySession = async () => {
      const fullstorySessionUrl = await FullStory.getCurrentSessionURL();
      Sentry.setContext('Fullstory', {
        sessionUrl: fullstorySessionUrl,
      });
    };
    const setRevision = async () => {
      const update = await codePush.getUpdateMetadata();

      Sentry.setTag('revision', update?.label || '');
    };

    setRevision();
    setFullstorySession();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NetworkProvider
          pingServerUrl={`${BASE_URL}markets`}
          pingInterval={60000}>
          <AppRoot />
        </NetworkProvider>
      </PersistGate>
    </Provider>
  );
};

const WrappedAppComponent = Sentry.wrap(AppComponent);

export default codePush({
  checkFrequency: codePush.CheckFrequency.ON_APP_START,
  installMode: codePush.InstallMode.IMMEDIATE,
})(WrappedAppComponent);
