import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';

import { assertRelativeModulePath, assertSafeModuleName } from './ipc/contracts';
import { modulesDir } from './paths';
import { loadSettingsFromFile } from './settings';

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function findDevelopmentModule(name) {
  for (const candidate of loadSettingsFromFile().devModulePaths || []) {
    try {
      const info = await readJson(path.join(candidate, 'nxs_package.dev.json'));
      if (info?.name === name) return path.resolve(candidate);
    } catch {
      // Invalid development module paths are reported by the module inventory.
    }
  }
  return undefined;
}

export async function resolveModuleRoot(name) {
  const moduleName = assertSafeModuleName(name);
  const installedRoot = path.resolve(modulesDir, moduleName);

  let leafStat;
  try {
    leafStat = await fs.lstat(installedRoot);
  } catch {
    leafStat = undefined;
  }

  if (leafStat) {
    if (leafStat.isSymbolicLink()) {
      throw new Error(`Module root must not be a symlink: ${moduleName}`);
    }
    if (leafStat.isDirectory()) {
      const realModulesDir = await fs.realpath(modulesDir);
      const realRoot = await fs.realpath(installedRoot);
      if (
        realRoot !== realModulesDir &&
        !realRoot.startsWith(`${realModulesDir}${path.sep}`)
      ) {
        throw new Error('Module root realpath escapes modules directory');
      }
      return { root: realRoot, development: false };
    }
  }

  const developmentRoot = await findDevelopmentModule(moduleName);
  if (developmentRoot) return { root: developmentRoot, development: true };
  throw new Error(`Module is not installed: ${moduleName}`);
}

function developmentAllowsSymlinks() {
  const settings = loadSettingsFromFile();
  return Boolean(settings?.devMode && settings?.allowSymLink);
}

/**
 * Resolve a module-relative file to a real path under root.
 * By default rejects leaf symlinks (same policy as fileServer.js). When
 * `allowSymlink` is true (development modules with devMode+allowSymLink), leaf
 * symlinks are permitted only if their realpath stays inside the module root.
 */
async function resolveModuleFile(
  root,
  relativePath,
  { allowSymlink = false } = {}
) {
  const file = assertRelativeModulePath(relativePath);
  const resolved = path.resolve(root, file);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    throw new Error('Module file must be inside the module directory');
  }

  const leafStat = await fs.lstat(resolved);
  if (leafStat.isSymbolicLink()) {
    if (!allowSymlink) {
      throw new Error(`Module file must be a regular non-symlink file: ${file}`);
    }
  } else if (!leafStat.isFile()) {
    throw new Error(`Module file must be a regular non-symlink file: ${file}`);
  }

  const realRoot = await fs.realpath(root);
  const realFile = await fs.realpath(resolved);
  if (realFile !== realRoot && !realFile.startsWith(`${realRoot}${path.sep}`)) {
    throw new Error('Module file realpath escapes module root');
  }

  // Symlink targets (and regular files) must resolve to a regular file.
  const realStat = await fs.stat(realFile);
  if (!realStat.isFile()) {
    throw new Error(`Module file must be a regular file: ${file}`);
  }

  return realFile;
}

export async function getModuleEntry(name, fileServerDomain) {
  const { root, development } = await resolveModuleRoot(name);
  const packageFile = path.join(
    root,
    development ? 'nxs_package.dev.json' : 'nxs_package.json'
  );
  const info = await readJson(packageFile);
  const entry = info?.entry || 'index.html';
  const allowSymlink = development && developmentAllowsSymlinks();
  const entryPath = await resolveModuleFile(root, entry, { allowSymlink });

  if (development) return pathToFileURL(entryPath).toString();
  const encodedEntry = entry
    .split(/[\\/]/)
    .map((part) => encodeURIComponent(part))
    .join('/');
  return `${fileServerDomain}/modules/${encodeURIComponent(name)}/${encodedEntry}`;
}

export async function validateModuleFiles(name, files) {
  const { root, development } = await resolveModuleRoot(name);
  const allowSymlink = development && developmentAllowsSymlinks();
  return Promise.all(
    files.map(async (file) => {
      await resolveModuleFile(root, file, { allowSymlink });
      return file;
    })
  );
}
