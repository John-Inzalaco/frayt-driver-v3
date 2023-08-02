jest.useFakeTimers();
// include this line for mocking react-native-gesture-handler
import 'react-native-gesture-handler/jestSetup';
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock';
import mock from '@stripe/stripe-react-native/jest/mock.js';
import mockRNDeviceInfo from 'react-native-device-info/jest/react-native-device-info-mock';

jest.mock('@stripe/stripe-react-native', () => mock);

jest.mock('react-native-permissions', () =>
  require('react-native-permissions/mock'),
);

jest.mock('react-native-device-info', () => mockRNDeviceInfo);

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

jest.mock('@stripe/stripe-react-native', () => mock);

jest.mock('@intercom/intercom-react-native', () => jest.fn());

jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo);

jest.mock('react-native-keyboard-aware-scroll-view', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const KeyboardAwareScrollView = require('react-native').ScrollView;
  return {KeyboardAwareScrollView};
});

jest.mock('react-native-safe-area-context', () => {
  const inset = {top: 0, right: 0, bottom: 0, left: 0};
  return {
    ...jest.requireActual('react-native-safe-area-context'),
    SafeAreaProvider: jest.fn(({children}) => children),
    SafeAreaConsumer: jest.fn(({children}) => children(inset)),
    useSafeAreaInsets: jest.fn(() => inset),
    useSafeAreaFrame: jest.fn(() => ({x: 0, y: 0, width: 390, height: 844})),
  };
});

// include this section and the NativeAnimatedHelper section for mocking react-native-reanimated
jest.mock('react-native-reanimated', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Reanimated = require('react-native-reanimated/mock');

  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  Reanimated.default.call = () => {};

  return Reanimated;
});

jest.mock(
  'react-native/Libraries/Components/Touchable/TouchableOpacity',
  () => {
    const TouchableOpacity = jest.requireActual(
      'react-native/Libraries/Components/Touchable/TouchableOpacity',
    );
    TouchableOpacity.displayName = 'TouchableOpacity';
    return TouchableOpacity;
  },
);

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('@fullstory/react-native', () => {
  jest.fn();
  jest.fn();
  jest.fn();
  jest.fn();
  jest.fn();
  jest.fn();
  jest.fn();
  jest.fn();
  jest.fn();
});

jest.mock('react-native-code-push', () => {
  const cp = () => app => app;
  Object.assign(cp, {
    InstallMode: {},
    CheckFrequency: {},
    SyncStatus: {},
    UpdateState: {},
    DeploymentStatus: {},
    DEFAULT_UPDATE_DIALOG: {},

    allowRestart: jest.fn(),
    checkForUpdate: jest.fn(() => Promise.resolve(null)),
    disallowRestart: jest.fn(),
    getCurrentPackage: jest.fn(() => Promise.resolve(null)),
    getUpdateMetadata: jest.fn(() => Promise.resolve(null)),
    notifyAppReady: jest.fn(() => Promise.resolve()),
    restartApp: jest.fn(),
    sync: jest.fn(() => Promise.resolve(1)),
    clearUpdates: jest.fn(),
  });
  return cp;
});

function FormDataMock() {
  this.append = jest.fn();
}

jest.mock('@sentry/react-native', () => ({
  init: () => jest.fn(),
  captureException: () => jest.fn(),
  wrap: () => jest.fn(),
}));

global.FormData = FormDataMock;
