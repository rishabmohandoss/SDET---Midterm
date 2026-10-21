const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Parse requires Node's `crypto`; point it at a small shim.
const upstream = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'crypto') return { type: 'sourceFile', filePath: path.resolve(__dirname, 'src/shims/crypto.js') };
  return (upstream || context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
