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

const azureSignOptions = {
  publisherName: 'Nexus Development US, LLC.',
  endpoint: 'https://wus2.codesigning.azure.net',
  TimestampRfc3161: 'http://timestamp.acs.microsoft.com',
  TimestampDigest: 'SHA256',
  certificateProfileName: "xxxxxxxxxxx",
  codeSigningAccountName: "xxxxxxxxxxx"
};

const macId = '"NEXUS DEVELOPMENT U S LLC"';

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
const unsigned = process.argv[3] === 'unsigned';
if (process.platform === 'win32') {
  const processedAzureSignOptions  = Object.keys(azureSignOptions).map(e => `-c.win.azureSignOptions.${e}=\"${azureSignOptions[e]}\"`).join(' ')
  execSync.execSync(
    `npm run package-win ${isTestnet ? '--testnet=true' : ''} ${
      unsigned ? '' : '-- ' + processedAzureSignOptions
    }`,
    {
      stdio: 'inherit',
    }
  );
} else if (process.platform === 'darwin') {
  execSync.execSync(
    `npm run package-mac ${unsigned ? '' : '-- -c.mac.identity=' + macId} ${
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
