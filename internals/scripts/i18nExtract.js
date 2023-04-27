/**
 * Inspired by i18n-extract https://github.com/oliviertassinari/i18n-extract
 */
import fs from 'fs';
import glob from 'glob';
import { transformSync } from '@babel/core';
import traverse from '@babel/traverse';

const noInformationTypes = ['CallExpression', 'Identifier', 'MemberExpression'];

function getKeys(node) {
  if (node.type === 'StringLiteral') {
    return [node.value];
  }
  if (node.type === 'BinaryExpression' && node.operator === '+') {
    const left = getKeys(node.left);
    const right = getKeys(node.right);
    if (left.length > 1 || right.length > 1) {
      console.warn(
        'Unsupported multiple keys for binary expression, keys skipped.'
      ); // TODO
    }
    return [left[0] + right[0]];
  }
  if (node.type === 'TemplateLiteral') {
    return [node.quasis.map((quasi) => quasi.value.cooked).join('*')];
  }
  if (node.type === 'ConditionalExpression') {
    return [...getKeys(node.consequent), ...getKeys(node.alternate)];
  }
  if (node.type === 'LogicalExpression') {
    switch (node.operator) {
      case '&&':
        return [...getKeys(node.right)];
      case '||':
        return [...getKeys(node.left), ...getKeys(node.right)];
      default:
        console.warn(
          `unsupported logicalExpression's operator: ${node.operator}`
        );
        return [null];
    }
  }
  if (noInformationTypes.includes(node.type)) {
    return ['*']; // We can't extract anything.
  }

  console.warn(`Unsupported node: ${node.type}`);

  return [null];
}

const commentRegExp = /i18n-extract (.+)/;
const commentIgnoreRegExp = /i18n-extract-disable-line/;

const translateMarker = '__';
const translateWithContextMarker = '___';
const withContextMarker = '__context';

function extractFromCode(code) {
  const babelOptions = {
    ast: true,
    plugins: [
      '@babel/plugin-syntax-jsx',
      ['@babel/plugin-syntax-class-properties', { loose: true }],
      // ['@babel/plugin-syntax-decorators', { legacy: true }],
    ],
  };

  const { ast } = transformSync(code, babelOptions);

  const keys = [];
  const ignoredLines = [];

  // Look for keys in the comments.
  ast.comments.forEach((comment) => {
    let match = commentRegExp.exec(comment.value);
    if (match) {
      keys.push({
        key: match[1].trim(),
        loc: comment.loc,
      });
    }

    // Check for ignored lines
    match = commentIgnoreRegExp.exec(comment.value);
    if (match) {
      ignoredLines.push(comment.loc.start.line);
    }
  });

  let context = '';

  // Look for keys in the source code.
  traverse(ast, {
    CallExpression(path) {
      const { node } = path;

      if (node.loc) {
        if (ignoredLines.includes(node.loc.end.line)) {
          // Skip ignored lines
          return;
        }
      }

      const {
        callee: { name, type },
      } = node;

      // withContext(context) calls
      if (
        (type === 'Identifier' && name === withContextMarker) ||
        path.get('callee').matchesPattern(withContextMarker)
      ) {
        const contextNode = node.arguments && node.arguments[0];
        context = (contextNode && contextNode.value) || '';
      }

      // default translate(string) calls
      if (
        (type === 'Identifier' && name === translateMarker) ||
        path.get('callee').matchesPattern(translateMarker)
      ) {
        const foundKeys = getKeys(node.arguments[0]);

        foundKeys.forEach((key) => {
          if (key) {
            keys.push({
              key,
              context,
              loc: node.loc,
            });
          }
        });
      }

      // translateWithContext(context, string) calls
      if (
        (type === 'Identifier' && name === translateWithContextMarker) ||
        path.get('callee').matchesPattern(translateWithContextMarker)
      ) {
        const contextNode = node.arguments && node.arguments[0];
        const tempContext = (contextNode && contextNode.value) || '';
        const foundKeys = getKeys(node.arguments[1]);

        foundKeys.forEach((key) => {
          if (key) {
            keys.push({
              key,
              context: tempContext,
              loc: node.loc,
            });
          }
        });
      }
    },
  });

  return keys;
}

export default function extractFromFiles(filenames, options) {
  const keys = [];

  // filenames should be an array
  if (typeof filenames === 'string') {
    filenames = [filenames];
  }

  let toScan = [];

  filenames.forEach((filename) => {
    toScan = toScan.concat(glob.sync(filename, {}));
  });

  toScan.forEach((filename) => {
    const code = fs.readFileSync(filename, 'utf8');
    const extractedKeys = extractFromCode(code, options);
    extractedKeys.forEach((keyObj) => {
      keyObj.file = filename;
      keys.push(keyObj);
    });
  });

  return keys;
}
