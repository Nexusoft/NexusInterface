import { join, isAbsolute } from 'path';
import fs from 'fs';
import crypto from 'crypto';
import Ajv from 'ajv';
import axios from 'axios';
import { isText } from 'istextorbinary';
import streamNormalizeEol from 'stream-normalize-eol';
import Multistream from 'multistream';

import showOpenDialog from 'utils/promisified/showOpenDialog';

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
    const normalizeNewline = streamNormalizeEol('\n');
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
export async function getModuleHash(dirPath, { module } = {}) {
  return new Promise((resolve, reject) => {
    try {
      const nxsPackagePath = join(dirPath, 'nxs_package.json');
      if (!module) {
        const nxsPackageContent = fs.readFileSync(nxsPackagePath);
        module = JSON.parse(nxsPackageContent);
      }
      const filePaths = module.files.sort().map(file => join(dirPath, file));
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
 * Returns the repository info including the Nexus signature if repo_info.json file does exist and is valid
 *
 * @param {*} dirPath
 * @returns
 */
export async function getRepoInfo(dirPath) {
  const filePath = join(dirPath, 'repo_info.json');
  // Check repo_info.json file exists
  if (!fs.existsSync(filePath) || fs.lstatSync(filePath).isSymbolicLink())
    return null;

  // Check repo_info.json file schema
  try {
    const fileContent = await fs.promises.readFile(filePath);
    const repoInfo = JSON.parse(fileContent);
    if (validateRepoInfo(repoInfo)) {
      return repoInfo;
    }
  } catch (err) {
    console.error(err);
  }

  return null;
}

/**
 * Check to see if Author is part of NexusSoft
 *
 * @export
 * @param {*} repoInfo
 * @returns {boolean} Is Author apart of Nexus
 */
export async function isAuthorPartOfOrg(repoInfo) {
  const { host, owner, repo, commit } = repoInfo.data.repository;
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
 * Check if the specified repository is currently still online
 *
 * @param {*} repoInfo
 * @returns
 */
export async function isRepoOnline(repoInfo) {
  const { host, owner, repo, commit } = repoInfo.data.repository;
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
export async function isRepoVerified(repoInfo, module, dirPath) {
  const { data, verification } = repoInfo;

  // Check public key matching
  if (!verification || !data.moduleHash) return false;

  // Check hash of module files matching
  try {
    const hash = module.hash || (await getModuleHash(dirPath, { module }));
    if (hash !== data.moduleHash) return false;

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
 * This script is for Nexus team to sign the repo verification
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
    const paths = await showOpenDialog({
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

  const moduleHash = await getModuleHash(moduleDir);
  const data = { repository: repo, moduleHash };
  const serializedData = JSON.stringify(data);

  if (!privKeyPath) {
    const paths = await showOpenDialog({
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
  const privKey = fs.readFileSync(privKeyPath);

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
  fs.writeFileSync(repoInfoPath, JSON.stringify(repoInfo, null, 2));

  console.log('Successfully generated repo_info.json file at ' + repoInfoPath);
}

// So that the function can be called on DevTools
window.__signModuleRepo = signModuleRepo;
