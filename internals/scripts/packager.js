#!/usr/bin/env node

const execSync = require('child_process');
const fs = require('fs');
const path = require('path');
const semver = require('semver');
const validChannels = ['', 'beta', 'alpha', 'testnet'];

const channel = process.argv[2] || '';
const isTestnet = channel && channel === 'testnet';

if (!validChannels.includes(channel)) {
  throw 'INVALID BUILD CHANNEL';
}

const fileName = 'package.json';
const file = require(path.resolve(fileName));

//https://leancrew.com/all-this/2020/06/ordinal-numerals-and-javascript/
function ordinal(n) {
  var s = ['th', 'st', 'nd', 'rd'];
  var v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const time = new Date();

file.buildDate = `${time.toLocaleString('en-US', { month: 'long' })} ${ordinal(
  time.getDate()
)} ${time.getFullYear()}`;

const currentVer = semver.parse(file.version);

const pre = currentVer.prerelease[0];
if (pre) {
  if (channel !== '') {
    if (pre !== channel) {
      file.version = `${currentVer.major}.${currentVer.minor}.${
        currentVer.patch
      }-${channel}.${currentVer.prerelease[1] || 0}`;
    }
  }
  if (channel === '') {
    throw 'Package marked for pre release';
  }
} else {
  if (channel !== '') {
    file.version = `${currentVer.major}.${currentVer.minor}.${
      currentVer.patch
    }-${channel}.${currentVer.prerelease[1] || 0}`;
  }
}

fs.writeFileSync(
  fileName,
  JSON.stringify(file, null, 2),
  function writeJSON(err) {
    if (err) return console.log(err);
  }
);

return;

if (process.platform === 'win32') {
  execSync.execSync(`npm run package-win ${isTestnet && '--testnet=true'}`, {
    stdio: 'inherit',
  });
} else if (process.platform === 'darwin') {
  execSync.execSync(`npm run package-mac ${isTestnet && '--testnet=true'}`, {
    stdio: 'inherit',
  });
} else {
  execSync.execSync(`package-linux ${isTestnet && '--testnet=true'}`, {
    stdio: 'inherit',
  });
}
