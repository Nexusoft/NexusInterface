import { join } from 'path';
import fs from 'fs';
import crypto from 'crypto';
import Ajv from 'ajv';
import axios from 'axios';
import { isText } from 'istextorbinary';
import streamNormalizeEol from 'stream-normalize-eol';
import Multistream from 'multistream';

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
 * Get the module hash, calculated by hashing all the files that it uses, concatenated
 *
 * @param {*} module
 * @param {*} dirPath
 * @returns
 */
async function getModuleHash(module, dirPath) {
  return new Promise((resolve, reject) => {
    try {
      const nxsPackagePath = join(dirPath, 'nxs_package.json');
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
 * Exports
 * =============================================================================
 */

/**
 * Returns the repository info including the Nexus signature if repo_info.json file does exist and is valid
 *
 * @param {*} dirPath
 * @returns
 */
export async function getRepoInfo(dirPath) {
  const filePath = join(dirPath, 'repo_info.json');
  // Check repo_info.json file exists
  if (!fs.existsSync(filePath)) return null;

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
      'github.com': `https://api.github.com/${owner}/${repo}/commits/${commit}`,
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
    const hash = await getModuleHash(module, dirPath);
    if (hash !== data.moduleHash) return false;
  } catch (err) {
    console.error(err);
    return false;
  }

  // Check signature
  const verified = crypto
    .createVerify('RSA-SHA256')
    .update(JSON.stringify(data))
    .end()
    .verify(NEXUS_EMBASSY_PUBLIC_KEY, verification.signature);
  return verified;
}
