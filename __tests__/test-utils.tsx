import {render} from '@testing-library/react-native';
import {ApplicationProvider, IconRegistry, Layout} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';
import {darkTheme} from '../src/theme';
import {store} from '../src/store';
import React from 'react';
import type {ReactElement} from 'react';
import {Provider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';

type AppChildren = {
  children: ReactElement[];
};

const AllTheProviders = ({children}: AppChildren) => {
  return (
    <Provider store={store}>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={darkTheme}>
        <SafeAreaProvider>
          <Layout>{children}</Layout>
        </SafeAreaProvider>
      </ApplicationProvider>
    </Provider>
  );
};

const customRender = (ui: ReactElement, options?: any) =>
  render(ui, {wrapper: AllTheProviders, ...options});

// re-export everything
export * from '@testing-library/react-native';

// override render method
export {customRender as render};
