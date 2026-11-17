'use strict';

const fs = require('fs');

function readJson(filePath, fallback) {
  let contents;
  try {
    contents = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw error;
  }
  const value = JSON.parse(contents);
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`Invalid JSON object in ${filePath}`);
  }
  return value;
}

module.exports = { readJson };
