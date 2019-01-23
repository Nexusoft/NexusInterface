const stage0Preset = [
  // Stage 0
  '@babel/plugin-proposal-function-bind',
  // Stage 1
  '@babel/plugin-proposal-export-default-from',
  '@babel/plugin-proposal-logical-assignment-operators',
  ['@babel/plugin-proposal-optional-chaining', { loose: false }],
  ['@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' }],
  ['@babel/plugin-proposal-nullish-coalescing-operator', { loose: false }],
  '@babel/plugin-proposal-do-expressions',
  // Stage 2
  ['@babel/plugin-proposal-decorators', { legacy: true }],
  '@babel/plugin-proposal-function-sent',
  '@babel/plugin-proposal-export-namespace-from',
  '@babel/plugin-proposal-numeric-separator',
  '@babel/plugin-proposal-throw-expressions',
  // Stage 3
  '@babel/plugin-syntax-dynamic-import',
  '@babel/plugin-syntax-import-meta',
  ['@babel/plugin-proposal-class-properties', { loose: true }],
  '@babel/plugin-proposal-json-strings',
];

const reactOptimizePreset = [
  '@babel/plugin-transform-react-constant-elements',
  // Leaves out transform-react-inline-elements plugin due to incompatibility with Emotion
  'babel-plugin-transform-react-remove-prop-types',
  'babel-plugin-transform-react-pure-class-to-function',
];

const devPlugins = [];

const prodPlugins = ['babel-plugin-dev-expression', ...reactOptimizePreset];

module.exports = function(api) {
  const development = process.env.NODE_ENV !== 'production';
  api.cache(true);

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: { electron: require('electron/package.json').version },
          useBuiltIns: 'usage',
        },
      ],
      ['@babel/preset-react', { development }],
    ],
    plugins: [
      ['emotion', { sourceMap: development }],
      ...stage0Preset,
      ...(development ? devPlugins : prodPlugins),
    ],
  };
};
