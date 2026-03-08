// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'node:sea': require.resolve('react-native-url-polyfill'), // Mock or polyfill
};

module.exports = config;
