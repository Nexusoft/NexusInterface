const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const yaml = require('js-yaml');
const { verifyRelease } = require('../../internals/scripts/verify-release');
const pkg = require('../../package.json');

const fixtures = {
  linux: {
    packages: ['nexus_wallet-Linux-VERSION.deb', 'nexus_wallet-Linux-VERSION.AppImage', 'nexus_wallet-Linux-VERSION.snap'],
    metadata: 'beta-linux.yml',
    update: 'nexus_wallet-Linux-VERSION.AppImage',
    resources: 'linux-unpacked/resources',
    core: 'linux/cores/nexus-linux-x64',
  },
  mac: {
    packages: ['nexus_wallet-MacOSX-VERSION.dmg', 'nexus_wallet-MacOSX-VERSION.zip'],
    metadata: 'beta-mac.yml',
    update: 'nexus_wallet-MacOSX-VERSION.zip',
    resources: 'mac/Nexus Wallet.app/Contents/Resources',
    core: 'darwin/cores/nexus-darwin-x64',
  },
  win: {
    packages: ['nexus_wallet-setup-Win-VERSION.exe'],
    metadata: 'beta.yml',
    update: 'nexus_wallet-setup-Win-VERSION.exe',
    resources: 'win-unpacked/resources',
    core: 'win32/cores/nexus-win32-x64.exe',
  },
};

function fixture(t, platform) {
  const cfg = fixtures[platform];
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-release-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dir, 'builder-debug.yml'), 'debug output');
  const versioned = (value) => value.replace('VERSION', pkg.version);
  for (const name of cfg.packages) fs.writeFileSync(path.join(dir, versioned(name)), 'installer');
  const digest = crypto.createHash('sha512').update('installer').digest('base64');
  fs.writeFileSync(path.join(dir, cfg.metadata), yaml.dump({
    version: pkg.version,
    files: [{ url: versioned(cfg.update), sha512: digest }],
  }));
  const resources = path.join(dir, cfg.resources);
  const core = path.join(resources, 'assets', cfg.core);
  fs.mkdirSync(path.dirname(core), { recursive: true });
  fs.copyFileSync(path.join('assets', cfg.core), core);
  if (platform !== 'win') fs.chmodSync(core, 0o755);
  fs.writeFileSync(path.join(resources, 'app-update.yml'), yaml.dump({
    provider: 'github', owner: 'NamecoinGithub', repo: 'NexusInterface',
  }));
  const licenses = path.join(resources, 'assets/misc/licenses');
  fs.mkdirSync(licenses, { recursive: true });
  fs.writeFileSync(path.join(licenses, 'embedded-cores.txt'), 'notices');
  return { dir, cfg, resources, versioned };
}

for (const platform of Object.keys(fixtures)) {
  test(`${platform} release verifies installers, core, updater and metadata`, {
    skip: process.platform === 'win32' && platform !== 'win'
      ? 'Windows filesystems cannot represent Unix executable bits'
      : false,
  }, (t) => {
    const { dir } = fixture(t, platform);
    verifyRelease(platform, dir);
    const checksums = fs.readFileSync(path.join(dir, `SHA256SUMS-${platform}.txt`), 'utf8');
    assert.match(checksums, /[a-f0-9]{64}  /);
    assert.doesNotMatch(checksums, /builder-debug\.yml/);
  });
}

test('Unix releases reject a non-executable core', {
  skip: process.platform === 'win32' ? 'Windows filesystems cannot represent Unix executable bits' : false,
}, (t) => {
  for (const platform of ['linux', 'mac']) {
    const { dir, cfg, resources } = fixture(t, platform);
    fs.chmodSync(path.join(resources, 'assets', cfg.core), 0o644);
    assert.throws(() => verifyRelease(platform, dir), /not executable/);
  }
});

test('release rejects incorrect update hashes and updater repositories', (t) => {
  const { dir, cfg, resources, versioned } = fixture(t, 'win');
  fs.writeFileSync(path.join(dir, versioned(cfg.update)), 'tampered');
  assert.throws(() => verifyRelease('win', dir), /checksum/);
  fs.writeFileSync(path.join(dir, versioned(cfg.update)), 'installer');
  fs.writeFileSync(path.join(resources, 'app-update.yml'), yaml.dump({
    provider: 'github', owner: 'Nexusoft', repo: 'NexusInterface',
  }));
  assert.throws(() => verifyRelease('win', dir), /unexpected repository/);
});

test('fallback update endpoint uses this repository', () => {
  const source = fs.readFileSync('src/main/updater.js', 'utf8');
  assert.match(source, /api\.github\.com\/repos\/NamecoinGithub\/NexusInterface\/releases\/latest/);
  assert.equal(pkg.build.publish.owner, 'NamecoinGithub');
  assert.equal(yaml.load(fs.readFileSync('dev-app-update.yml', 'utf8')).owner, 'NamecoinGithub');
});
