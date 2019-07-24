const { extractFromFiles } = require('i18n-extract');

const keys = extractFromFiles('src/**/*.js', {
  marker: '__',
  babelOptions: {
    ast: true,
    plugins: [
      '@babel/plugin-syntax-jsx',
      ['@babel/plugin-syntax-class-properties', { loose: true }],
      ['@babel/plugin-syntax-decorators', { legacy: true }],
    ],
  },
});
console.log(JSON.stringify(keys.map(e => e.key).sort(), null, 2));
console.log(keys.length);
