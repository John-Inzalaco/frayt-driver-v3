/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const MetroConfig = require('@ui-kitten/metro-config');

/**
 * @see https://akveo.github.io/react-native-ui-kitten/docs/guides/improving-performance
 */
const evaConfig = {
  evaPackage: '@eva-design/eva',
  customMappingPath: './src/mapping.json',
};

const defaultSourceExts =
  require('metro-config/src/defaults/defaults').sourceExts;

module.exports = MetroConfig.create(evaConfig, {
  resolver: {
    sourceExts:
      process.env.MY_APP_MODE === 'mocked'
        ? ['mock.ts', 'mock.tsx', ...defaultSourceExts]
        : defaultSourceExts,
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
});
