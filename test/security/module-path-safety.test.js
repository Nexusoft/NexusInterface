'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  DEFAULT_MAX_FILE_BYTES,
  READ_CHUNK_BYTES,
  REPLACED_DIR_INFIX,
  STAGING_DIR_INFIX,
  cleanupInternalModuleDirectories,
  copyModuleFiles,
  installModuleDirectory,
  isActiveInternalPath,
  listPublicModuleDirectoryNames,
  readFileHandleBounded,
  readRegularFileNoFollow,
  registerActiveInternalPath,
  setSupportsFdRelativeOpenForTests,
  supportsFdRelativeOpen,
  unregisterActiveInternalPath,
} = require('../../src/main/ipc/safeCopy');

const root = path.resolve(__dirname, '../..');
const read = (...segments) =>
  fs.readFileSync(path.join(root, ...segments), 'utf8');

async function makeTempDir(prefix) {
  return fsp.mkdtemp(path.join(os.tmpdir(), prefix));
}

async function writeModuleTree(moduleRoot, files) {
  await fsp.mkdir(moduleRoot, { recursive: true });
  for (const [relativePath, contents] of Object.entries(files)) {
    const absolutePath = path.join(moduleRoot, relativePath);
    await fsp.mkdir(path.dirname(absolutePath), { recursive: true });
    await fsp.writeFile(absolutePath, contents);
  }
}

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

test('module asset and entry resolvers reject symlinks and realpath escapes', () => {
  const fileAssets = read('src', 'main', 'fileAssets.js');
  const moduleFiles = read('src', 'main', 'moduleFiles.js');
  const fileServer = read('src', 'main', 'fileServer.js');
  const safeCopy = read('src', 'main', 'ipc', 'safeCopy.js');

  for (const [name, source] of [
    ['fileAssets.js', fileAssets],
    ['moduleFiles.js', moduleFiles],
    ['fileServer.js', fileServer],
    ['safeCopy.js', safeCopy],
  ]) {
    assert.match(source, /lstat/, `${name} must lstat before reading`);
    assert.match(
      source,
      /isSymbolicLink/,
      `${name} must reject symbolic links`
    );
    assert.match(source, /realpath/, `${name} must verify real paths`);
    assert.match(
      source,
      /realpath escapes module root|escapes module root/,
      `${name} must reject realpath escapes`
    );
  }

  assert.match(fileAssets, /assertRelativeModulePath/);
  assert.match(fileAssets, /readModuleIcon/);
  assert.match(fileAssets, /readRegularFileNoFollow/);
  assert.match(fileAssets, /data:image\/png;base64/);
  assert.match(
    fileAssets,
    /allowPathFallback:\s*!development \|\| process\.platform !== 'win32'/,
    'development module icons must fail closed without fd-relative opens on Windows'
  );
  assert.match(moduleFiles, /resolveModuleFile/);
  assert.match(moduleFiles, /allowSymlink/);
  assert.match(moduleFiles, /developmentAllowsSymlinks|allowSymLink/);
  assert.match(
    moduleFiles,
    /development \? 'nxs_package\.dev\.json' : 'nxs_package\.json'/,
    'authorized files must come from the on-disk manifest in both modes'
  );
  assert.match(
    moduleFiles,
    /validateModuleFilePaths/,
    'the authoritative on-disk manifest must enforce the module file limit'
  );
  assert.match(
    moduleFiles,
    /if \(!moduleFiles\.includes\(entry\)\)[\s\S]*throw new Error/,
    'the effective module entry must be present in the authorized file list'
  );
  assert.match(
    read('src', 'main', 'modules.js'),
    /nxsPackageDevSchema[\s\S]*files:\s*z\s*\.array/,
    'development manifests must declare a validated file list'
  );
  assert.match(
    moduleFiles,
    /root:\s*realRoot/,
    'authorized files must return the same canonical root as their real paths'
  );
  assert.match(
    moduleFiles,
    /allowPathFallback:\s*!development \|\| process\.platform !== 'win32'/,
    'development module files must fail closed without fd-relative opens on Windows'
  );
  assert.match(
    fileServer,
    /await readRegularFileNoFollow\(asset\.absolutePath,[\s\S]*root:\s*asset\.root/,
    'module files must be opened without following links at request time'
  );
  assert.doesNotMatch(fileServer, /res\.sendFile\(/);
  assert.match(fileServer, /MAX_MODULE_ASSET_BYTES/);
  assert.match(fileServer, /MAX_CONCURRENT_ASSET_READS/);
  assert.match(fileServer, /function reserveAssetReadSlot/);
  assert.match(
    fileServer,
    /if \(!reserveAssetReadSlot\(\)\)[\s\S]*Module file server busy/
  );
  assert.match(
    fileServer,
    /if \(released \|\| !readDone \|\| !responseDone\) return/
  );
  assert.match(fileServer, /res\.once\('finish', finishResponse\)/);
  assert.match(fileServer, /res\.type\(path\.basename\(relative\)\)\.send\(content\)/);
  assert.match(
    safeCopy,
    /matchesTrustedPathIdentity[\s\S]*process\.platform !== 'win32'[\s\S]*actual\.ino !== expected\.ino/
  );
  assert.match(
    moduleFiles,
    /Module root must not be a symlink/,
    'installed module roots must reject directory symlinks'
  );
  assert.match(
    moduleFiles,
    /escapes modules directory/,
    'installed module roots must stay under modulesDir'
  );
  assert.match(safeCopy, /assertNoSymlinkComponents/);
  assert.match(safeCopy, /installModuleDirectory/);
  assert.match(safeCopy, /\.replaced-/);
  assert.match(safeCopy, /setSupportsFdRelativeOpenForTests/);
});

test('safeCopy rejects leaf symlinks, intermediate directory symlinks, and escapes', async () => {
  const tempRoot = await makeTempDir('module-path-safety-');
  const moduleRoot = path.join(tempRoot, 'module');
  const outsideDir = path.join(tempRoot, 'outside');
  const destRoot = path.join(tempRoot, 'dest');

  try {
    await writeModuleTree(moduleRoot, {
      'nxs_package.json': '{"name":"demo"}',
      'assets/index.html': '<html>ok</html>',
      'assets/nested/file.txt': 'payload',
    });
    await fsp.mkdir(outsideDir, { recursive: true });
    await fsp.writeFile(path.join(outsideDir, 'secret.txt'), 'SECRET');

    const good = await readRegularFileNoFollow(
      path.join(moduleRoot, 'assets', 'index.html'),
      {
        root: moduleRoot,
        label: 'assets/index.html',
        allowPathFallback: true,
      }
    );
    assert.equal(String(good), '<html>ok</html>');

    // Root itself must be opened with O_NOFOLLOW: a symlink root is rejected.
    const symlinkRoot = path.join(tempRoot, 'symlink-root');
    await fsp.symlink(moduleRoot, symlinkRoot);
    await assert.rejects(
      () =>
        readRegularFileNoFollow(path.join(symlinkRoot, 'assets', 'index.html'), {
          root: symlinkRoot,
          label: 'assets/index.html',
          allowPathFallback: true,
        }),
      /symbolic link|module root/
    );

    await fsp.symlink(
      path.join(outsideDir, 'secret.txt'),
      path.join(moduleRoot, 'assets', 'leaf-link.txt')
    );
    await assert.rejects(
      () =>
        readRegularFileNoFollow(path.join(moduleRoot, 'assets', 'leaf-link.txt'), {
          root: moduleRoot,
          label: 'assets/leaf-link.txt',
          allowPathFallback: true,
        }),
      /symbolic link|regular non-symlink/
    );

    await fsp.rm(path.join(moduleRoot, 'assets', 'nested'), {
      recursive: true,
      force: true,
    });
    await fsp.symlink(outsideDir, path.join(moduleRoot, 'assets', 'nested'));
    await assert.rejects(
      () =>
        readRegularFileNoFollow(
          path.join(moduleRoot, 'assets', 'nested', 'secret.txt'),
          {
            root: moduleRoot,
            label: 'assets/nested/secret.txt',
            allowPathFallback: true,
          }
        ),
      /symbolic link|escapes module root/
    );

    await assert.rejects(
      () =>
        readRegularFileNoFollow(path.join(outsideDir, 'secret.txt'), {
          root: moduleRoot,
          label: 'outside',
          allowPathFallback: true,
        }),
      /escapes module root/
    );

    await assert.rejects(
      () =>
        readRegularFileNoFollow(path.join(moduleRoot, 'missing.txt'), {
          root: moduleRoot,
          label: 'missing.txt',
          allowPathFallback: true,
        }),
      /not found|ENOENT/
    );

    await writeModuleTree(moduleRoot, {
      'nxs_package.json': '{"name":"demo"}',
      'index.html': '<html>ok</html>',
      'data.bin': 'abc',
    });
    // Restore assets as a real directory for a successful copy.
    await fsp.rm(path.join(moduleRoot, 'assets'), { recursive: true, force: true });

    await copyModuleFiles(['index.html', 'data.bin'], moduleRoot, destRoot, {
      trustedSource: true,
    });
    assert.equal(
      await fsp.readFile(path.join(destRoot, 'index.html'), 'utf8'),
      '<html>ok</html>'
    );
    assert.equal(await fsp.readFile(path.join(destRoot, 'data.bin'), 'utf8'), 'abc');
    assert.equal(
      await fsp.readFile(path.join(destRoot, 'nxs_package.json'), 'utf8'),
      '{"name":"demo"}'
    );

    await fsp.rm(destRoot, { recursive: true, force: true });
    await fsp.symlink(outsideDir, path.join(moduleRoot, 'evil-dir'));
    await assert.rejects(
      () =>
        copyModuleFiles(
          ['index.html', path.join('evil-dir', 'secret.txt')],
          moduleRoot,
          destRoot,
          { trustedSource: true }
        ),
      /symbolic link|escapes module root/
    );
    // Non-atomic copyModuleFiles may create destination dirs before failing;
    // the outside secret must never be installed.
    if (fs.existsSync(destRoot)) {
      assert.equal(
        fs.existsSync(path.join(destRoot, 'evil-dir', 'secret.txt')),
        false
      );
      assert.doesNotMatch(
        await fsp
          .readFile(path.join(destRoot, 'index.html'), 'utf8')
          .catch(() => ''),
        /SECRET/
      );
    }
  } finally {
    await fsp.rm(tempRoot, { recursive: true, force: true });
  }
});

test('installModuleDirectory stages then renames a complete module tree', async () => {
  const tempRoot = await makeTempDir('module-install-atomic-');
  const sourceRoot = path.join(tempRoot, 'source');
  const modulesHome = path.join(tempRoot, 'modules');
  const destRoot = path.join(modulesHome, 'demo');

  try {
    await writeModuleTree(sourceRoot, {
      'nxs_package.json': '{"name":"demo","files":["index.html"]}',
      'index.html': '<html>installed</html>',
      'repo_info.json': '{"ok":true}',
    });
    await fsp.mkdir(modulesHome, { recursive: true });

    await installModuleDirectory(['index.html'], sourceRoot, destRoot, {
      trustedSource: true,
    });

    assert.equal(
      await fsp.readFile(path.join(destRoot, 'index.html'), 'utf8'),
      '<html>installed</html>'
    );
    assert.equal(
      await fsp.readFile(path.join(destRoot, 'repo_info.json'), 'utf8'),
      '{"ok":true}'
    );

    const leftovers = (await fsp.readdir(modulesHome)).filter((name) =>
      name.includes(STAGING_DIR_INFIX)
    );
    assert.deepEqual(leftovers, []);

    // Failed copy must not leave the destination module directory behind.
    await fsp.rm(destRoot, { recursive: true, force: true });
    await fsp.symlink(path.join(tempRoot, 'missing-target'), path.join(sourceRoot, 'bad'));
    await assert.rejects(
      () =>
        installModuleDirectory(['index.html', 'bad'], sourceRoot, destRoot, {
          trustedSource: true,
        }),
      /symbolic link|regular non-symlink|not found/
    );
    assert.equal(fs.existsSync(destRoot), false);
    const failedLeftovers = (await fsp.readdir(modulesHome)).filter((name) =>
      name.includes(STAGING_DIR_INFIX)
    );
    assert.deepEqual(failedLeftovers, []);

    // verifyStaging runs before rename; rejection must leave no published module.
    await fsp.rm(path.join(sourceRoot, 'bad'), { force: true });
    await assert.rejects(
      () =>
        installModuleDirectory(['index.html'], sourceRoot, destRoot, {
          trustedSource: true,
          verifyStaging: async () => {
            throw new Error('staging validation failed');
          },
        }),
      /staging validation failed/
    );
    assert.equal(fs.existsSync(destRoot), false);
    const verifyLeftovers = (await fsp.readdir(modulesHome)).filter((name) =>
      name.includes(STAGING_DIR_INFIX)
    );
    assert.deepEqual(verifyLeftovers, []);

    // Overwrite installs must keep the previous module until staging verifies,
    // and restore it if publish fails after the swap begins.
    await writeModuleTree(destRoot, {
      'nxs_package.json': '{"name":"demo","files":["index.html"]}',
      'index.html': '<html>previous</html>',
    });
    await writeModuleTree(sourceRoot, {
      'nxs_package.json': '{"name":"demo","files":["index.html"]}',
      'index.html': '<html>replacement</html>',
    });
    await assert.rejects(
      () =>
        installModuleDirectory(['index.html'], sourceRoot, destRoot, {
          trustedSource: true,
          verifyStaging: async () => {
            throw new Error('overwrite staging failed');
          },
        }),
      /overwrite staging failed/
    );
    assert.equal(
      await fsp.readFile(path.join(destRoot, 'index.html'), 'utf8'),
      '<html>previous</html>',
      'failed overwrite must leave the previous install intact'
    );
    const replacedLeftovers = (await fsp.readdir(modulesHome)).filter(
      (name) => name.includes(STAGING_DIR_INFIX) || name.includes('.replaced-')
    );
    assert.deepEqual(replacedLeftovers, []);

    await installModuleDirectory(['index.html'], sourceRoot, destRoot, {
      trustedSource: true,
    });
    assert.equal(
      await fsp.readFile(path.join(destRoot, 'index.html'), 'utf8'),
      '<html>replacement</html>'
    );
    const successLeftovers = (await fsp.readdir(modulesHome)).filter(
      (name) => name.includes(STAGING_DIR_INFIX) || name.includes('.replaced-')
    );
    assert.deepEqual(successLeftovers, []);
  } finally {
    await fsp.rm(tempRoot, { recursive: true, force: true });
  }
});

test('installModuleDirectory serializes same-destination publishes when overwrite is false', async () => {
  const tempRoot = await makeTempDir('module-install-serialize-same-');
  const modulesHome = path.join(tempRoot, 'modules');
  const sourceA = path.join(tempRoot, 'source-a');
  const sourceB = path.join(tempRoot, 'source-b');
  const destRoot = path.join(modulesHome, 'demo');
  const firstReachedVerify = createDeferred();
  const allowFirstPublish = createDeferred();

  try {
    await writeModuleTree(sourceA, {
      'nxs_package.json': '{"name":"demo","files":["index.html"]}',
      'index.html': '<html>first</html>',
    });
    await writeModuleTree(sourceB, {
      'nxs_package.json': '{"name":"demo","files":["index.html"]}',
      'index.html': '<html>second</html>',
    });
    await fsp.mkdir(modulesHome, { recursive: true });

    const firstInstall = installModuleDirectory(['index.html'], sourceA, destRoot, {
      overwrite: false,
      trustedSource: true,
      verifyStaging: async () => {
        firstReachedVerify.resolve();
        await allowFirstPublish.promise;
      },
    });
    await firstReachedVerify.promise;

    const secondInstall = installModuleDirectory(['index.html'], sourceB, destRoot, {
      overwrite: false,
      trustedSource: true,
    });

    allowFirstPublish.resolve();

    const [firstResult, secondResult] = await Promise.allSettled([
      firstInstall,
      secondInstall,
    ]);

    assert.equal(firstResult.status, 'fulfilled');
    assert.equal(secondResult.status, 'rejected');
    assert.equal(secondResult.reason?.code, 'ALREADY_EXISTS');
    assert.match(secondResult.reason?.message || '', /already exists/i);
    assert.equal(
      await fsp.readFile(path.join(destRoot, 'index.html'), 'utf8'),
      '<html>first</html>'
    );
    assert.deepEqual(
      (await fsp.readdir(modulesHome)).filter(
        (name) =>
          name.includes(STAGING_DIR_INFIX) || name.includes(REPLACED_DIR_INFIX)
      ),
      []
    );
  } finally {
    allowFirstPublish.resolve();
    await fsp.rm(tempRoot, { recursive: true, force: true });
  }
});

test('installModuleDirectory preserves parallelism for different destination names', async () => {
  const tempRoot = await makeTempDir('module-install-serialize-different-');
  const modulesHome = path.join(tempRoot, 'modules');
  const sourceA = path.join(tempRoot, 'source-a');
  const sourceB = path.join(tempRoot, 'source-b');
  const destA = path.join(modulesHome, 'demo-a');
  const destB = path.join(modulesHome, 'demo-b');
  const firstReachedVerify = createDeferred();
  const allowFirstPublish = createDeferred();

  try {
    await writeModuleTree(sourceA, {
      'nxs_package.json': '{"name":"demo-a","files":["index.html"]}',
      'index.html': '<html>first</html>',
    });
    await writeModuleTree(sourceB, {
      'nxs_package.json': '{"name":"demo-b","files":["index.html"]}',
      'index.html': '<html>second</html>',
    });
    await fsp.mkdir(modulesHome, { recursive: true });

    const firstInstall = installModuleDirectory(['index.html'], sourceA, destA, {
      overwrite: false,
      trustedSource: true,
      verifyStaging: async () => {
        firstReachedVerify.resolve();
        await allowFirstPublish.promise;
      },
    });
    await firstReachedVerify.promise;

    await installModuleDirectory(['index.html'], sourceB, destB, {
      overwrite: false,
      trustedSource: true,
    });
    assert.equal(
      await fsp.readFile(path.join(destB, 'index.html'), 'utf8'),
      '<html>second</html>'
    );

    allowFirstPublish.resolve();
    await firstInstall;
    assert.equal(
      await fsp.readFile(path.join(destA, 'index.html'), 'utf8'),
      '<html>first</html>'
    );
  } finally {
    allowFirstPublish.resolve();
    await fsp.rm(tempRoot, { recursive: true, force: true });
  }
});

test(
  'installModuleDirectory restores overwritten modules if final publish rename fails',
  { concurrency: false },
  async () => {
  const tempRoot = await makeTempDir('module-install-overwrite-rollback-');
  const sourceRoot = path.join(tempRoot, 'source');
  const modulesHome = path.join(tempRoot, 'modules');
  const destRoot = path.join(modulesHome, 'demo');
  const originalRename = fsp.rename;
  let verifyCount = 0;
  let failPublishRename = true;

  try {
    await writeModuleTree(sourceRoot, {
      'nxs_package.json': '{"name":"demo","files":["index.html"]}',
      'index.html': '<html>replacement</html>',
      }
    );
    await writeModuleTree(destRoot, {
      'nxs_package.json': '{"name":"demo","files":["index.html"]}',
      'index.html': '<html>previous</html>',
    });

    fsp.rename = async (from, to) => {
      if (
        failPublishRename &&
        path.resolve(to) === path.resolve(destRoot) &&
        path.basename(from).includes(STAGING_DIR_INFIX)
      ) {
        failPublishRename = false;
        throw new Error('publish rename failed');
      }
      return originalRename(from, to);
    };

    await assert.rejects(
      () =>
        installModuleDirectory(['index.html'], sourceRoot, destRoot, {
          overwrite: true,
          trustedSource: true,
          verifyStaging: async () => {
            verifyCount += 1;
          },
        }),
      /publish rename failed/
    );
    assert.equal(
      await fsp.readFile(path.join(destRoot, 'index.html'), 'utf8'),
      '<html>previous</html>'
    );

    fsp.rename = originalRename;
    await installModuleDirectory(['index.html'], sourceRoot, destRoot, {
      overwrite: true,
      trustedSource: true,
      verifyStaging: async () => {
        verifyCount += 1;
      },
    });
    assert.equal(
      await fsp.readFile(path.join(destRoot, 'index.html'), 'utf8'),
      '<html>replacement</html>'
    );
    assert.equal(verifyCount, 2);
  } finally {
    fsp.rename = originalRename;
    await fsp.rm(tempRoot, { recursive: true, force: true });
  }
});

test('installModuleDirectory releases its destination lock after a failed install', async () => {
  const tempRoot = await makeTempDir('module-install-lock-release-');
  const modulesHome = path.join(tempRoot, 'modules');
  const failingSource = path.join(tempRoot, 'source-fail');
  const goodSource = path.join(tempRoot, 'source-good');
  const destRoot = path.join(modulesHome, 'demo');

  try {
    await writeModuleTree(failingSource, {
      'nxs_package.json': '{"name":"demo","files":["index.html"]}',
      'index.html': '<html>broken</html>',
    });
    await writeModuleTree(goodSource, {
      'nxs_package.json': '{"name":"demo","files":["index.html"]}',
      'index.html': '<html>good</html>',
    });
    await fsp.mkdir(modulesHome, { recursive: true });

    await assert.rejects(
      () =>
        installModuleDirectory(['index.html'], failingSource, destRoot, {
          overwrite: false,
          trustedSource: true,
          verifyStaging: async () => {
            throw new Error('staging validation failed');
          },
        }),
      /staging validation failed/
    );

    await installModuleDirectory(['index.html'], goodSource, destRoot, {
      overwrite: false,
      trustedSource: true,
    });
    assert.equal(
      await fsp.readFile(path.join(destRoot, 'index.html'), 'utf8'),
      '<html>good</html>'
    );
  } finally {
    await fsp.rm(tempRoot, { recursive: true, force: true });
  }
});

test('electron-updater uses patched builder-util-runtime', () => {
  const packageJson = JSON.parse(read('package.json'));
  // Keep an exact pin so CI fails closed on accidental ranges/downgrades.
  assert.equal(packageJson.dependencies['electron-updater'], '6.8.9');

  const lock = JSON.parse(read('package-lock.json'));
  const updaterEntry = lock.packages?.['node_modules/electron-updater'];
  assert.equal(updaterEntry?.version, '6.8.9');
  assert.equal(
    updaterEntry?.dependencies?.['builder-util-runtime'],
    '9.7.0'
  );
  assert.equal(
    lock.packages?.['node_modules/electron-updater/node_modules/builder-util-runtime'],
    undefined,
    'nested vulnerable builder-util-runtime must not be present'
  );
});

test('Electron fullscreen menu role uses the built-in lowercase name', () => {
  const appMenu = read('src', 'shared', 'lib', 'appMenu.ts');
  const mainJs = read('src', 'main', 'main.js');
  assert.match(appMenu, /role:\s*['"]togglefullscreen['"]/);
  assert.doesNotMatch(appMenu, /role:\s*['"]toggleFullScreen['"]/);
  assert.match(
    mainJs,
    /allowedMenuRoles[\s\S]*['"]togglefullscreen['"]/,
    'menu sanitizer must allow the lowercase Electron role'
  );
  assert.doesNotMatch(
    mainJs,
    /allowedMenuRoles[\s\S]*['"]toggleFullScreen['"]/,
    'menu sanitizer must not require the rejected camelCase role'
  );
});

test('copyModuleFiles deduplicates declared paths and copies sequentially', async () => {
  const tempRoot = await makeTempDir('module-copy-dedupe-');
  const moduleRoot = path.join(tempRoot, 'module');
  const destRoot = path.join(tempRoot, 'dest');
  const safeCopySource = read('src', 'main', 'ipc', 'safeCopy.js');
  const modulesSource = read('src', 'main', 'modules.js');

  assert.match(safeCopySource, /new Set\(/);
  assert.match(safeCopySource, /COPY_CONCURRENCY\s*=\s*1/);
  assert.match(safeCopySource, /directoryFdPath|\/proc\/self\/fd|\/dev\/fd/);
  assert.match(safeCopySource, /trustedSource/);
  assert.match(safeCopySource, /readFileHandleBounded/);
  assert.match(
    safeCopySource,
    /maxBytes\) \+ 1|maxBytes \+ 1|limit \+ 1|Math\.floor\(maxBytes\)/
  );
  assert.match(safeCopySource, /activeInternalPaths/);
  assert.doesNotMatch(safeCopySource, /Buffer\.concat\(/);
  assert.doesNotMatch(safeCopySource, /materializeAppOwnedSourceSnapshot/);
  assert.doesNotMatch(safeCopySource, /source-snapshot-/);
  assert.doesNotMatch(safeCopySource, /forceSourceSnapshot/);
  assert.match(
    safeCopySource,
    /descriptor-relative opens on this platform/
  );
  assert.match(
    modulesSource,
    /package the module as a \.zip archive/
  );

  try {
    await writeModuleTree(moduleRoot, {
      'nxs_package.json': '{"name":"demo"}',
      'index.html': '<html>ok</html>',
      'assets/a.txt': 'a',
    });

    await copyModuleFiles(
      ['index.html', 'index.html', 'assets/a.txt', 'assets/a.txt'],
      moduleRoot,
      destRoot,
      { trustedSource: true }
    );

    assert.equal(
      await fsp.readFile(path.join(destRoot, 'index.html'), 'utf8'),
      '<html>ok</html>'
    );
    assert.equal(
      await fsp.readFile(path.join(destRoot, 'assets', 'a.txt'), 'utf8'),
      'a'
    );

    // App-owned trusted roots remain installable even when the caller opts into
    // the path-fallback path used on platforms without fd-relative opens.
    const trustedDest = path.join(tempRoot, 'dest-trusted');
    await copyModuleFiles(
      ['index.html', 'assets/a.txt'],
      moduleRoot,
      trustedDest,
      { trustedSource: true }
    );
    assert.equal(
      await fsp.readFile(path.join(trustedDest, 'index.html'), 'utf8'),
      '<html>ok</html>'
    );
    assert.equal(
      await fsp.readFile(path.join(trustedDest, 'assets', 'a.txt'), 'utf8'),
      'a'
    );
  } finally {
    await fsp.rm(tempRoot, { recursive: true, force: true });
  }
});

test('listPublicModuleDirectoryNames excludes internal install directories', async () => {
  const tempRoot = await makeTempDir('module-inventory-filter-');
  const modulesHome = path.join(tempRoot, 'modules');

  try {
    await writeModuleTree(path.join(modulesHome, 'demo'), {
      'nxs_package.json': '{"name":"demo","files":["index.html"]}',
      'index.html': '<html>demo</html>',
    });
    await fsp.mkdir(
      path.join(modulesHome, `.demo${STAGING_DIR_INFIX}leftover`),
      { recursive: true }
    );
    await fsp.mkdir(
      path.join(modulesHome, `.demo${REPLACED_DIR_INFIX}leftover`),
      { recursive: true }
    );

    assert.deepEqual(
      await listPublicModuleDirectoryNames(modulesHome),
      ['demo']
    );
    assert.equal(
      fs.existsSync(path.join(modulesHome, `.demo${STAGING_DIR_INFIX}leftover`)),
      false
    );
    assert.equal(
      fs.existsSync(path.join(modulesHome, `.demo${REPLACED_DIR_INFIX}leftover`)),
      false
    );
  } finally {
    await fsp.rm(tempRoot, { recursive: true, force: true });
  }
});

test('internal install cleanup stays inside modulesDir and leaves normal modules intact', async () => {
  const tempRoot = await makeTempDir('module-inventory-confined-');
  const modulesHome = path.join(tempRoot, 'modules');
  const outsideDir = path.join(tempRoot, 'outside');
  const symlinkName = `.demo${REPLACED_DIR_INFIX}symlink`;
  const logs = [];

  try {
    await writeModuleTree(path.join(modulesHome, 'demo'), {
      'nxs_package.json': '{"name":"demo","files":["index.html"]}',
      'index.html': '<html>demo</html>',
    });
    await fsp.mkdir(outsideDir, { recursive: true });
    await fsp.writeFile(path.join(outsideDir, 'secret.txt'), 'outside');
    await fsp.symlink(outsideDir, path.join(modulesHome, symlinkName));

    assert.deepEqual(
      await listPublicModuleDirectoryNames(modulesHome, {
        log: (message) => logs.push(message),
      }),
      ['demo']
    );
    assert.equal(
      await fsp.readFile(path.join(modulesHome, 'demo', 'index.html'), 'utf8'),
      '<html>demo</html>'
    );
    assert.equal(
      await fsp.readFile(path.join(outsideDir, 'secret.txt'), 'utf8'),
      'outside'
    );
    assert.equal(fs.existsSync(path.join(modulesHome, symlinkName)), true);
    assert.match(logs.join('\n'), /Skipping internal install cleanup/);
  } finally {
    await fsp.rm(tempRoot, { recursive: true, force: true });
  }
});

test(
  'cleanup failure keeps the new module usable and stale backups excluded from inventory',
  { concurrency: false },
  async () => {
  const tempRoot = await makeTempDir('module-inventory-cleanup-failure-');
  const sourceRoot = path.join(tempRoot, 'source');
  const modulesHome = path.join(tempRoot, 'modules');
  const destRoot = path.join(modulesHome, 'demo');
  const originalRm = fsp.rm;
  const logs = [];

  try {
    await writeModuleTree(sourceRoot, {
      'nxs_package.json': '{"name":"demo","files":["index.html"]}',
      'index.html': '<html>replacement</html>',
      }
    );
    await writeModuleTree(destRoot, {
      'nxs_package.json': '{"name":"demo","files":["index.html"]}',
      'index.html': '<html>previous</html>',
    });

    fsp.rm = async (targetPath, options) => {
      if (path.basename(String(targetPath)).includes(REPLACED_DIR_INFIX)) {
        const err = new Error('replacement busy');
        err.code = 'EBUSY';
        throw err;
      }
      return originalRm(targetPath, options);
    };

    await installModuleDirectory(['index.html'], sourceRoot, destRoot, {
      overwrite: true,
      trustedSource: true,
    });
    assert.equal(
      await fsp.readFile(path.join(destRoot, 'index.html'), 'utf8'),
      '<html>replacement</html>'
    );

    const staleBackups = (await fsp.readdir(modulesHome)).filter((name) =>
      name.includes(REPLACED_DIR_INFIX)
    );
    assert.equal(staleBackups.length, 1);
    assert.deepEqual(
      await listPublicModuleDirectoryNames(modulesHome, {
        log: (message) => logs.push(message),
      }),
      ['demo']
    );
    assert.equal(
      fs.existsSync(path.join(modulesHome, staleBackups[0])),
      true
    );
    assert.match(logs.join('\n'), /Failed to clean internal install directory/);

    fsp.rm = originalRm;
    assert.deepEqual(await listPublicModuleDirectoryNames(modulesHome), ['demo']);
    assert.deepEqual(
      (await fsp.readdir(modulesHome)).filter((name) =>
        name.includes(REPLACED_DIR_INFIX)
      ),
      []
    );
  } finally {
    fsp.rm = originalRm;
    await fsp.rm(tempRoot, { recursive: true, force: true });
  }
});

test('readFileHandleBounded uses bounded chunks and enforces exact and growing-file limits', async () => {
  const seenAllocations = [];
  const tinyHandle = {
    reads: 0,
    async read(buffer, offset) {
      seenAllocations.push(buffer.length);
      if (this.reads === 0) {
        this.reads += 1;
        buffer.write('ok', offset, 'utf8');
        return { bytesRead: 2 };
      }
      return { bytesRead: 0 };
    },
  };

  const tiny = await readFileHandleBounded(
    tinyHandle,
    DEFAULT_MAX_FILE_BYTES,
    'tiny file'
  );
  assert.equal(String(tiny), 'ok');
  assert.ok(
    seenAllocations.every((size) => size <= READ_CHUNK_BYTES),
    'tiny-file reads must stay chunk-bounded'
  );
  assert.ok(
    Math.max(...seenAllocations) < DEFAULT_MAX_FILE_BYTES,
    'tiny-file reads must not allocate the full configured maximum'
  );

  const exactChunks = [Buffer.from('ab'), Buffer.from('cd'), Buffer.alloc(0)];
  const exactHandle = {
    async read(buffer, offset, length) {
      const chunk = exactChunks.shift() || Buffer.alloc(0);
      chunk.copy(buffer, offset, 0, Math.min(length, chunk.length));
      return { bytesRead: Math.min(length, chunk.length) };
    },
  };
  const exact = await readFileHandleBounded(exactHandle, 4, 'exact file');
  assert.equal(String(exact), 'abcd');

  const growingChunks = [Buffer.from('ab'), Buffer.from('cde')];
  const growingHandle = {
    async read(buffer, offset, length) {
      const chunk = growingChunks.shift() || Buffer.alloc(0);
      chunk.copy(buffer, offset, 0, Math.min(length, chunk.length));
      return { bytesRead: Math.min(length, chunk.length) };
    },
  };
  await assert.rejects(
    () => readFileHandleBounded(growingHandle, 4, 'growing file'),
    /exceeds the size limit/
  );

  // Verified-size path: one result allocation plus a 1-byte growth probe.
  const sizedReads = [];
  let sizedOffset = 0;
  const sizedPayload = Buffer.from('verified');
  const sizedHandle = {
    async stat() {
      return { size: sizedPayload.length };
    },
    async read(buffer, offset, length, position) {
      sizedReads.push({ length, position });
      if (position >= sizedPayload.length) {
        return { bytesRead: 0 };
      }
      const bytes = sizedPayload.copy(
        buffer,
        offset,
        position,
        Math.min(position + length, sizedPayload.length)
      );
      sizedOffset = position + bytes;
      return { bytesRead: bytes };
    },
  };
  const sized = await readFileHandleBounded(sizedHandle, 32, 'sized file');
  assert.equal(String(sized), 'verified');
  assert.equal(sized.length, sizedPayload.length);
  assert.ok(
    sizedReads.some((entry) => entry.length === 1 && entry.position === sizedOffset),
    'verified-size reads must probe one extra byte for growth'
  );

  const grownHandle = {
    async stat() {
      return { size: 4 };
    },
    async read(buffer, offset, length, position) {
      const payload = Buffer.from('abcde');
      if (position >= payload.length) {
        return { bytesRead: 0 };
      }
      const bytes = payload.copy(
        buffer,
        offset,
        position,
        Math.min(position + length, payload.length)
      );
      return { bytesRead: bytes };
    },
  };
  await assert.rejects(
    () => readFileHandleBounded(grownHandle, 16, 'grown past verified size'),
    /exceeds the size limit/
  );
});

test('cleanup skips active internal paths and restores orphaned replacements', async () => {
  const tempRoot = await makeTempDir('module-active-internal-cleanup-');
  const modulesHome = path.join(tempRoot, 'modules');
  const activeStaging = path.join(
    modulesHome,
    `.demo${STAGING_DIR_INFIX}active`
  );
  const orphanedBackup = path.join(
    modulesHome,
    `.demo${REPLACED_DIR_INFIX}orphan`
  );
  const staleStaging = path.join(
    modulesHome,
    `.other${STAGING_DIR_INFIX}stale`
  );

  try {
    await fsp.mkdir(activeStaging, { recursive: true });
    await fsp.writeFile(path.join(activeStaging, 'marker.txt'), 'staging');
    await fsp.mkdir(orphanedBackup, { recursive: true });
    await fsp.writeFile(
      path.join(orphanedBackup, 'index.html'),
      '<html>recovered</html>'
    );
    await fsp.mkdir(staleStaging, { recursive: true });

    registerActiveInternalPath(activeStaging);
    assert.equal(isActiveInternalPath(activeStaging), true);

    const cleaned = await cleanupInternalModuleDirectories(modulesHome);
    assert.ok(!cleaned.includes(path.basename(activeStaging)));
    assert.equal(fs.existsSync(activeStaging), true);
    assert.equal(fs.existsSync(staleStaging), false);
    assert.equal(fs.existsSync(orphanedBackup), false);
    assert.equal(
      await fsp.readFile(path.join(modulesHome, 'demo', 'index.html'), 'utf8'),
      '<html>recovered</html>'
    );
    assert.deepEqual(await listPublicModuleDirectoryNames(modulesHome), [
      'demo',
    ]);
  } finally {
    unregisterActiveInternalPath(activeStaging);
    await fsp.rm(tempRoot, { recursive: true, force: true });
  }
});

test('in-flight install staging survives concurrent inventory cleanup', async () => {
  const tempRoot = await makeTempDir('module-inflight-cleanup-');
  const sourceRoot = path.join(tempRoot, 'source');
  const modulesHome = path.join(tempRoot, 'modules');
  const destRoot = path.join(modulesHome, 'demo');
  const gate = createDeferred();
  let sawActiveStaging = false;

  try {
    await writeModuleTree(sourceRoot, {
      'nxs_package.json': '{"name":"demo","files":["index.html"]}',
      'index.html': '<html>new</html>',
    });

    const installPromise = installModuleDirectory(
      ['index.html'],
      sourceRoot,
      destRoot,
      {
        overwrite: false,
        trustedSource: true,
        verifyStaging: async (stagingPath) => {
          assert.equal(isActiveInternalPath(stagingPath), true);
          sawActiveStaging = true;
          const cleaned = await cleanupInternalModuleDirectories(modulesHome);
          assert.ok(!cleaned.includes(path.basename(stagingPath)));
          assert.equal(fs.existsSync(stagingPath), true);
          await listPublicModuleDirectoryNames(modulesHome);
          assert.equal(fs.existsSync(stagingPath), true);
          gate.resolve();
        },
      }
    );

    await gate.promise;
    await installPromise;
    assert.equal(sawActiveStaging, true);
    assert.equal(
      await fsp.readFile(path.join(destRoot, 'index.html'), 'utf8'),
      '<html>new</html>'
    );
    assert.deepEqual(
      (await fsp.readdir(modulesHome)).filter((name) =>
        name.includes(STAGING_DIR_INFIX)
      ),
      []
    );
  } finally {
    await fsp.rm(tempRoot, { recursive: true, force: true });
  }
});

test('readRegularFileNoFollow fails closed without fd-relative or path fallback', async () => {
  const safeCopySource = read('src', 'main', 'ipc', 'safeCopy.js');
  assert.match(safeCopySource, /allowPathFallback/);
  assert.match(
    safeCopySource,
    /concreteChildPath = path\.join\(concreteParentPath, segment\)/
  );
  assert.match(safeCopySource, /allowPathFallback &&\s*process\.platform/);
  assert.match(
    safeCopySource,
    /descriptor-relative opens or an app-owned trusted root/
  );
});

test('copyModuleFiles fails closed for mutable sources without fd-relative opens', async () => {
  // Always exercise the Windows fail-closed branch on Linux CI by injecting the
  // capability flag rather than depending on process.platform.
  assert.equal(typeof supportsFdRelativeOpen, 'function');
  assert.equal(typeof setSupportsFdRelativeOpenForTests, 'function');

  const tempRoot = await makeTempDir('module-copy-fail-closed-');
  try {
    const moduleRoot = path.join(tempRoot, 'module');
    const destRoot = path.join(tempRoot, 'dest');
    await writeModuleTree(moduleRoot, {
      'nxs_package.json': '{"name":"demo"}',
      'index.html': '<html>ok</html>',
    });

    setSupportsFdRelativeOpenForTests(false);
    assert.equal(supportsFdRelativeOpen(), false);

    await assert.rejects(
      () => copyModuleFiles(['index.html'], moduleRoot, destRoot),
      /descriptor-relative opens on this platform/
    );
    await assert.rejects(
      () =>
        readRegularFileNoFollow(path.join(moduleRoot, 'index.html'), {
          root: moduleRoot,
          label: 'index.html',
        }),
      /descriptor-relative opens or an app-owned trusted root/
    );

    await copyModuleFiles(['index.html'], moduleRoot, destRoot, {
      trustedSource: true,
    });
    assert.equal(
      await fsp.readFile(path.join(destRoot, 'index.html'), 'utf8'),
      '<html>ok</html>'
    );

    // Trusted-root path fallback still works when explicitly opted in.
    const trustedRead = await readRegularFileNoFollow(
      path.join(moduleRoot, 'index.html'),
      {
        root: moduleRoot,
        label: 'index.html',
        allowPathFallback: true,
      }
    );
    assert.equal(String(trustedRead), '<html>ok</html>');
  } finally {
    // Restore auto-detection so later tests see the real host capability.
    setSupportsFdRelativeOpenForTests(null);
    await fsp.rm(tempRoot, { recursive: true, force: true });
  }
});

test('Build Guide documents the package engines Node/npm floor', () => {
  const buildGuide = read('docs', 'Build_Guide.md');
  const packageJson = JSON.parse(read('package.json'));

  assert.match(buildGuide, /Node\.js \(min v22\.12\.0\)/);
  assert.match(buildGuide, /NPM \(min v10\.9\.0\)/);
  assert.equal(packageJson.engines.node, '>=22.12.0');
  assert.equal(packageJson.engines.npm, '>=10.9.0');
  assert.doesNotMatch(buildGuide, /min v16\.x/);
  assert.doesNotMatch(buildGuide, /min v8\.x/);
});
