module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            // tsconfig.json의 paths 설정과 일치시킵니다.
            // '@' 별칭을 './app' 디렉토리로 매핑합니다.
            '@': './app',
          },
        },
      ],
      // react-native-reanimated/plugin은 항상 마지막에 위치해야 합니다.
      'react-native-reanimated/plugin',
    ],
  };
};