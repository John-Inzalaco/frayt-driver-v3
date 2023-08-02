import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import {StripeProvider} from '@stripe/stripe-react-native';
import {useSelector} from 'react-redux';
import {STRIPE_PUBLISH_KEY} from './env';
import {darkTheme} from './theme';
import OSProvider from './OSProvider';
import {AppNavigator} from './navigation/AppNavigator';
import {BackgroundTracking} from './components/BackgroundTracking';
import {selectTheme} from './slices/user';

export default function AppRoot() {
  const _currentTheme = useSelector(selectTheme);

  // TODO: Removed until light theme stylings are fixed
  // const theme = currentTheme === 'Light' ? lightTheme : darkTheme;

  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={darkTheme}>
        <SafeAreaProvider>
          <NavigationContainer>
            <ActionSheetProvider>
              <StripeProvider publishableKey={STRIPE_PUBLISH_KEY}>
                <BackgroundTracking />
                <OSProvider>
                  <AppNavigator />
                </OSProvider>
              </StripeProvider>
            </ActionSheetProvider>
          </NavigationContainer>
        </SafeAreaProvider>
      </ApplicationProvider>
    </>
  );
}
