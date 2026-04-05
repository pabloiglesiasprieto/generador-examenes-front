module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { unstable_transformProfile: 'hermes-stable' }]
    ],
    plugins: [
      'react-native-reanimated/plugin',
    ],
    overrides: [
      {
        exclude: /node_modules/,
        plugins: [
          ['@babel/plugin-proposal-decorators', { legacy: true }],
          'babel-plugin-transform-typescript-metadata',
          ['@babel/plugin-proposal-class-properties', { loose: true }],
        ],
      },
    ],
  };
};