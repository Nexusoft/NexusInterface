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
const packageJson = require(path.resolve(fileName));

//https://leancrew.com/all-this/2020/06/ordinal-numerals-and-javascript/
function ordinal(n) {
  var s = ['th', 'st', 'nd', 'rd'];
  var v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Sets New build date
const time = new Date();
packageJson.buildDate = `${time.toLocaleString('en-US', {
  month: 'long',
})} ${ordinal(time.getDate())} ${time.getFullYear()}`;

// Makes sure semver is correct
const currentVer = semver.parse(packageJson.version);
const pre = currentVer.prerelease[0];
if (pre) {
  if (channel !== '') {
    if (pre !== channel) {
      packageJson.version = `${currentVer.major}.${currentVer.minor}.${
        currentVer.patch
      }-${channel}.${currentVer.prerelease[1] || 0}`;
    }
  }
  if (channel === '') {
    throw 'Package marked for pre release';
  }
} else {
  if (channel !== '') {
    packageJson.version = `${currentVer.major}.${currentVer.minor}.${
      currentVer.patch
    }-${channel}.${currentVer.prerelease[1] || 0}`;
  }
}

//Sets channel in build config
if (channel) {
  packageJson.build.publish.channel = channel;
} else {
  if (packageJson.build.publish.channel) {
    delete packageJson.build.publish.channel;
  }
}

// write package back, second param will immitate prettier
fs.writeFileSync(
  fileName,
  JSON.stringify(packageJson, null, 2),
  function writeJSON(err) {
    if (err) return console.log(err);
  }
);

if (process.platform === 'win32') {
  execSync.execSync(
    `npm run package-win ${isTestnet ? '--testnet=true' : ''}`,
    {
      stdio: 'inherit',
    }
  );
} else if (process.platform === 'darwin') {
  const unsigned = process.argv[3] === 'unsigned';
  execSync.execSync(
    `npm run package-mac${unsigned ? '-unsigned' : ''} ${
      isTestnet ? '--testnet=true' : ''
    }`,
    {
      stdio: 'inherit',
    }
  );
} else {
  execSync.execSync(
    `npm run package-linux ${isTestnet ? '--testnet=true' : ''}`,
    {
      stdio: 'inherit',
    }
  );
}
