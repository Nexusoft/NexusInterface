import { join } from 'path';
import fs from 'fs';
import crypto from 'crypto';
import Ajv from 'ajv';
import axios from 'axios';
import { isText } from 'istextorbinary';
import normalizeEol from 'utils/normalizeEol';
import Multistream from 'multistream';
import { ipcRenderer } from 'electron';

import { loadModuleFromDir } from './module';

const ajv = new Ajv();

// Schema for repo_info.json
const repoInfoSchema = {
  additionalProperties: false,
  required: ['data'],
  properties: {
    verification: {
      type: 'object',
      required: ['signature'],
      properties: {
        signature: { type: 'string' },
      },
    },
    data: {
      type: 'object',
      additionalProperties: false,
      required: ['repository'],
      properties: {
        moduleHash: { type: 'string' },
        repository: {
          type: 'object',
          required: ['type', 'host', 'owner', 'repo', 'commit'],
          properties: {
            type: { type: 'string', enum: ['git'] },
            // Allowed hosting: github.com
            host: { type: 'string', enum: ['github.com'] },
            owner: { type: 'string' },
            repo: { type: 'string' },
            // Full SHA-1 hash of the git commit this version was built on
            commit: { type: 'string', minLength: 40, maxLength: 40 },
          },
        },
      },
    },
  },
};
const validateRepoInfo = ajv.compile(repoInfoSchema);

/**
 * Normalize the newline character so the same file will produce the same
 * hash in different Operating Systems
 *
 * @param {*} path
 * @returns
 */
function normalizeFile(path) {
  const stream = fs.createReadStream(path);
  if (isText(path, stream)) {
    const normalizeNewline = normalizeEol('\n');
    return stream.pipe(normalizeNewline);
  } else {
    return stream;
  }
}

/**
 * Exports
 * =============================================================================
 */

/**
 * Get the module hash, calculated by hashing all the files that it uses, concatenated
 *
 * @param {*} dirPath
 * @returns
 */
export async function getModuleHash(module) {
  return new Promise(async (resolve, reject) => {
    try {
      const nxsPackagePath = join(module.path, 'nxs_package.json');
      const filePaths = module.info.files
        .sort()
        .map(file => join(module.path, file));
      const streams = [
        normalizeFile(nxsPackagePath),
        ...filePaths.map(normalizeFile),
      ];

      const hash = crypto.createHash('sha256');
      hash.setEncoding('base64');
      hash.on('readable', () => {
        resolve(hash.read());
      });
      new Multistream(streams).pipe(hash);
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}

/**
 * Returns the repository info including the Nexus signature
 * if repo_info.json file does exist and is valid
 *
 * @param {*} dirPath
 * @returns
 */
export async function loadRepoInfo(dirPath) {
  const filePath = join(dirPath, 'repo_info.json');
  // Check repo_info.json file exists
  if (!fs.existsSync(filePath)) return null;

  // Check repo_info.json file is a symbolic link
  const lstat = await fs.promises.lstat(filePath);
  if (lstat.isSymbolicLink()) return null;

  try {
    // Load file content
    const fileContent = await fs.promises.readFile(filePath);
    const repoInfo = JSON.parse(fileContent);

    // Validate schema
    if (validateRepoInfo(repoInfo)) {
      return repoInfo;
    }
  } catch (err) {
    console.error(err);
  }

  return null;
}

/**
 * Check if the specified repository is currently still online
 *
 * @param {*} repoInfo
 * @returns
 */
export async function isRepoOnline({ host, owner, repo, commit }) {
  if (!host || !owner || !repo || !commit) return false;

  try {
    const apiUrls = {
      'github.com': `https://api.github.com/repos/${owner}/${repo}/commits/${commit}`,
    };
    const url = apiUrls[host];
    const response = await axios.get(url);
    return !!response.data.sha && response.data.sha === commit;
  } catch (err) {
    console.error(err);
    return false;
  }
}

/**
 * Check if the module hash and Nexus signature do exist and are valid
 *
 * @param {*} repoInfo
 * @param {*} module
 * @param {*} dirPath
 * @returns
 */
export async function isModuleVerified(module, repoInfo) {
  const { data, verification } = repoInfo;
  if (!verification || !data || !data.moduleHash) return false;

  try {
    // Check if hash of module files matching
    if (data.moduleHash !== module.hash) return false;

    // Check signature
    const serializedData = JSON.stringify(data);
    const verified = crypto
      .createVerify('RSA-SHA256')
      .update(serializedData, 'utf8')
      .end()
      .verify(
        {
          key: NEXUS_EMBASSY_PUBLIC_KEY,
          format: 'pem',
        },
        verification.signature,
        'base64'
      );
    return verified;
  } catch (err) {
    console.error(err);
    return false;
  }
}

/**
 * Check to see if Author is part of NexusSoft
 *
 * @export
 * @param {*} repoInfo
 * @returns {boolean} Is Author apart of Nexus
 */
export async function isRepoFromNexus({ host, owner, repo, commit }) {
  if (!host || !owner || !repo || !commit) return false;

  if (owner === 'Nexusoft') return true;

  try {
    const apiUrls = {
      'github.com': `https://api.github.com/users/${owner}/orgs`,
    };
    const url = apiUrls[host];
    const response = await axios.get(url);
    const listOfOrgs = JSON.parse(response.request.response);
    const partOfNexus = listOfOrgs.find(e => e.login === 'Nexusoft');
    return !!partOfNexus;
  } catch (err) {
    console.error(err);
    return false;
  }
}

/**
 * =============================================================================
 * This script is for Nexus team to sign the repo verification
 * =============================================================================
 *
 * @param {*} repoUrl
 * @param {*} [{ moduleDir, privKeyPath, privKeyPassphrase }={}]
 * @returns
 */
async function signModuleRepo(
  repoUrl,
  { moduleDir, privKeyPath, privKeyPassphrase } = {}
) {
  const repoUrlRegex = /https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/commit\/([^\/]+)/i;
  const matches = repoUrlRegex.exec(repoUrl);
  if (!matches) {
    throw '`repoUrl` is missing or invalid. Please remember to include the commit in the URL.';
  }
  const repo = {
    type: 'git',
    host: 'github.com',
    owner: matches[1],
    repo: matches[2],
    commit: matches[3],
  };

  if (!moduleDir) {
    const paths = await ipcRenderer.invoke('show-open-dialog', {
      title: 'Select module directory',
      properties: ['openDirectory'],
    });
    if (paths && paths.length > 0) {
      moduleDir = paths[0];
    } else {
      return;
    }
  }
  if (!fs.existsSync(moduleDir)) {
    throw '`moduleDir` does not exist';
  }

  const module = await loadModuleFromDir(moduleDir);
  const data = { repository: repo, moduleHash: module.hash };
  const serializedData = JSON.stringify(data);

  if (!privKeyPath) {
    const paths = await ipcRenderer.invoke('show-open-dialog', {
      title: 'Select private key file',
      properties: ['openFile'],
      filters: { extensions: ['pem'] },
    });
    if (paths && paths.length > 0) {
      privKeyPath = paths[0];
    } else {
      return;
    }
  }
  const privKey = await fs.promises.readFile(privKeyPath);

  const signature = crypto
    .createSign('RSA-SHA256')
    .update(serializedData, 'utf8')
    .end()
    .sign(
      {
        key: privKey,
        format: 'pem',
        passphrase: privKeyPassphrase || undefined,
      },
      'base64'
    );

  const repoInfo = {
    verification: { signature },
    data,
  };
  const repoInfoPath = join(moduleDir, 'repo_info.json');
  await fs.promises.writeFile(repoInfoPath, JSON.stringify(repoInfo, null, 2));

  console.log('Successfully generated repo_info.json file at ' + repoInfoPath);
}

// So that the function can be called on DevTools
window.__signModuleRepo = signModuleRepo;
