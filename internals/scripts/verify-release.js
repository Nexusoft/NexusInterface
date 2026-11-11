#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const pkg = require('../../package.json');

const platforms = {
  linux: {
    packages: ['nexus_wallet-Linux-VERSION.deb', 'nexus_wallet-Linux-VERSION.AppImage', 'nexus_wallet-Linux-VERSION.snap'],
    metadataSuffix: '-linux.yml',
    updatePackage: 'nexus_wallet-Linux-VERSION.AppImage',
    resources: 'linux-unpacked/resources',
    core: 'linux/cores/nexus-linux-x64',
  },
  mac: {
    packages: ['nexus_wallet-MacOSX-VERSION.dmg', 'nexus_wallet-MacOSX-VERSION.zip'],
    metadataSuffix: '-mac.yml',
    updatePackage: 'nexus_wallet-MacOSX-VERSION.zip',
    resources: 'mac/Nexus Wallet.app/Contents/Resources',
    core: 'darwin/cores/nexus-darwin-x64',
  },
  win: {
    packages: ['nexus_wallet-setup-Win-VERSION.exe'],
    metadataSuffix: '.yml',
    updatePackage: 'nexus_wallet-setup-Win-VERSION.exe',
    resources: 'win-unpacked/resources',
    core: 'win32/cores/nexus-win32-x64.exe',
  },
};

function hash(file, algorithm, encoding) {
  return crypto.createHash(algorithm).update(fs.readFileSync(file)).digest(encoding);
}

function verifyRelease(platform, releaseDir = 'release') {
  const config = platforms[platform];
  if (!config) throw new Error(`Unknown release platform: ${platform}`);
  const metadataName = `${pkg.build.publish.channel || 'latest'}${config.metadataSuffix}`;
  const versioned = (name) => name.replace('VERSION', pkg.version);
  const packages = config.packages.map(versioned);
  for (const name of [...packages, metadataName]) {
    const file = path.join(releaseDir, name);
    if (!fs.statSync(file).isFile() || fs.statSync(file).size === 0) {
      throw new Error(`Missing or empty release artifact: ${file}`);
    }
  }

  const metadata = yaml.load(fs.readFileSync(path.join(releaseDir, metadataName), 'utf8'));
  if (metadata.version !== pkg.version || !Array.isArray(metadata.files)) {
    throw new Error(`Invalid update metadata: ${metadataName}`);
  }
  const updateName = versioned(config.updatePackage);
  const updateFile = metadata.files.find((entry) => decodeURIComponent(entry.url) === updateName);
  if (!updateFile || updateFile.sha512 !== hash(path.join(releaseDir, updateName), 'sha512', 'base64')) {
    throw new Error(`Update metadata checksum does not match ${updateName}`);
  }

  const resources = path.join(releaseDir, config.resources);
  const packagedCore = path.join(resources, 'assets', config.core);
  const sourceCore = path.join('assets', config.core);
  if (hash(packagedCore, 'sha256', 'hex') !== hash(sourceCore, 'sha256', 'hex')) {
    throw new Error(`Packaged core differs from ${sourceCore}`);
  }
  if (platform !== 'win' && !(fs.statSync(packagedCore).mode & 0o111)) {
    throw new Error(`Packaged core is not executable: ${packagedCore}`);
  }
  const updateConfig = yaml.load(fs.readFileSync(path.join(resources, 'app-update.yml'), 'utf8'));
  if (updateConfig.provider !== 'github' || updateConfig.owner !== 'NamecoinGithub' || updateConfig.repo !== 'NexusInterface') {
    throw new Error('Packaged updater points to an unexpected repository');
  }
  if (!fs.existsSync(path.join(resources, 'assets/misc/licenses/embedded-cores.txt'))) {
    throw new Error('Embedded core license notices are missing');
  }

  const files = fs.readdirSync(releaseDir).filter((name) =>
    packages.includes(name) || name === metadataName || name.endsWith('.blockmap')
  ).sort();
  const checksums = files.map((name) => `${hash(path.join(releaseDir, name), 'sha256', 'hex')}  ${name}`).join('\n') + '\n';
  fs.writeFileSync(path.join(releaseDir, `SHA256SUMS-${platform}.txt`), checksums);
  console.log(`Verified ${platform} ${pkg.version}: ${files.join(', ')}`);
}

if (require.main === module) verifyRelease(process.argv[2]);
module.exports = { verifyRelease };
