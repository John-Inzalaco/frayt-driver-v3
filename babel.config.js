module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'module:react-native-dotenv',
    '@fullstory/react-native',
    ['@fullstory/babel-plugin-annotate-react', {native: true}],
  ],
};
