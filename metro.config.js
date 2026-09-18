const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure the main entry point is properly resolved
config.mainFields = ['main', 'module', 'browser'];

// Watch all files in the project directory
config.watchFolders = [__dirname];

// Ensure proper resolution of root files including uppercase PNG extensions
config.resolver = {
  ...config.resolver,
  assetExts: [
    ...((config.resolver?.assetExts || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'mp3', 'wav', 'ogg', 'ttf', 'otf', 'woff', 'woff2'])), 
    'PNG'
  ],
  sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'],
  resolverMainFields: ['react-native', 'browser', 'main'],
  nodeModulesPaths: [__dirname + '/node_modules'],
  // Add custom resolver for PNG files
  extraNodeModules: {},
};

// Explicitly set the entry point to index.js
config.entry = './index.js';

module.exports = config;