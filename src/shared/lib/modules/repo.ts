import crypto from 'crypto';
import { ipcRenderer } from 'electron';
import fs from 'fs';
import type { IncomingMessage } from 'http';
import https from 'https';
import { isText } from 'istextorbinary';
import Multistream from 'multistream';
import { join } from 'path';
import normalizeEol from 'utils/normalizeEol';
import z from 'zod';

import { loadModuleFromDir, ModuleInfo } from './module';
import { getMembers } from 'lib/github';

const repoSchema = z.object({
  type: z.enum(['git']),
  // Allowed hosting: github.com
  host: z.enum(['github.com']),
  owner: z.string(),
  repo: z.string(),
  // Full SHA-1 hash of the git commit this version was built on
  commit: z.string().min(40).max(40),
});

// Schema for repo_info.json
const repoInfoSchema = z.object({
  verification: z
    .object({
      signature: z.string(),
    })
    .optional(),
  data: z.object({
    repository: repoSchema,
    moduleHash: z.string().optional(),
  }),
});

export type Repository = z.infer<typeof repoSchema>;
export type RepoInfo = z.infer<typeof repoInfoSchema>;

/**
 * Normalize the newline character so the same file will produce the same
 * hash in different Operating Systems
 */
function normalizeFile(path: string) {
  const stream = fs.createReadStream(path);
  const buffer = fs.readFileSync(path);
  if (isText(path, buffer)) {
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
 */
export function getModuleHash(moduleInfo: ModuleInfo, dirPath: string) {
  return new Promise<string | undefined>(async (resolve, reject) => {
    try {
      const nxsPackagePath = join(dirPath, 'nxs_package.json');
      const filePaths = moduleInfo.files
        .sort()
        .map((file) => join(dirPath, file));
      const streams = [
        normalizeFile(nxsPackagePath),
        ...filePaths.map(normalizeFile),
      ];

      const hash = crypto.createHash('sha256');
      hash.setEncoding('base64');
      hash.on('readable', () => {
        const result = hash.read();
        resolve(result ? String(result) : undefined);
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
 */
export async function loadRepoInfo(dirPath: string) {
  const filePath = join(dirPath, 'repo_info.json');
  // Check repo_info.json file exists
  if (!fs.existsSync(filePath)) return undefined;

  // Check repo_info.json file is a symbolic link
  const lstat = await fs.promises.lstat(filePath);
  if (lstat.isSymbolicLink()) return undefined;

  try {
    // Load file content
    const fileContent = await fs.promises.readFile(filePath);
    const rawRepoInfo = JSON.parse(String(fileContent));

    // Validate schema
    const repoInfo = repoInfoSchema.parse(rawRepoInfo);
    return repoInfo;
  } catch (err) {
    console.error(err);
  }

  return undefined;
}

/**
 * Check if the specified repository is currently still online
 */
export async function isRepoOnline(repository: Repository | undefined) {
  if (!repository) return false;
  const { host, owner, repo, commit } = repository;
  if (!host || !owner || !repo || !commit) return false;

  try {
    const apiUrls = {
      'github.com': `https://github.com/${owner}/${repo}/commit/${commit}`,
    };
    const url = apiUrls[host];
    const requestHead = (url: string) =>
      new Promise<IncomingMessage>((resolve, reject) => {
        try {
          https
            .request(url, { method: 'HEAD' }, (res) => resolve(res))
            .on('error', (err) => {
              reject(err);
            })
            .end();
        } catch (error) {
          reject(error);
        }
      });

    const res = await requestHead(url);
    return res.statusCode === 200;
  } catch (err) {
    console.error(err);
    return false;
  }
}

/**
 * Check if the module hash and Nexus signature do exist and are valid
 */
export async function isModuleVerified(
  moduleHash: string | undefined,
  repoInfo: RepoInfo | undefined
) {
  if (!repoInfo) return false;
  const { data, verification } = repoInfo;
  if (!verification || !data || !data.moduleHash) return false;

  try {
    // Check if hash of module files matching
    if (data.moduleHash !== moduleHash) return false;

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
 */
export async function isRepoFromNexus(repository: Repository | undefined) {
  if (!repository) return false;
  const { host, owner, repo, commit } = repository;
  if (!host || !owner || !repo || !commit) return false;

  if (owner === 'Nexusoft') return true;

  const nexusOrgUsers = await getNexusOrgUsers();
  if (!nexusOrgUsers) return false;
  else return nexusOrgUsers.includes(owner);
}

/**
 * Get the list of github users that belongs to Nexusoft organization
 */
export const getNexusOrgUsers = (() => {
  let nexusOrgUsers: string[];
  // Cache the ongoing request promise so it won't send another request
  // when the last one wasn't finished
  let promise: Promise<string[]> | null = null;
  return () => {
    if (!promise) {
      promise = new Promise(async (resolve, reject) => {
        if (!nexusOrgUsers) {
          try {
            const response = await getMembers('Nexusoft');
            nexusOrgUsers = response.data.map(
              (e: { login: string }) => e.login
            );
          } catch (err) {
            console.error(err);
            return reject(err);
          } finally {
            // Signaling that the call has ended
            // If it was successful, nexusOrgUsers would have been assigned
            promise = null;
          }
        }
        resolve(nexusOrgUsers);
      });
    }
    return promise;
  };
})();

/**
 * =============================================================================
 * This script is for Nexus team to sign the repo verification
 * =============================================================================
 */
async function signModuleRepo(
  repoUrl: string,
  {
    moduleDir,
    privKeyPath,
    privKeyPassphrase,
  }: {
    moduleDir?: string;
    privKeyPath?: string;
    privKeyPassphrase?: string;
  } = {}
) {
  const repoUrlRegex =
    /https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/commit\/([^\/]+)/i;
  const matches = repoUrlRegex.exec(repoUrl);
  if (!matches) {
    throw new Error(
      '`repoUrl` is missing or invalid. Please remember to include the commit in the URL.'
    );
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
  if (!moduleDir || !fs.existsSync(moduleDir)) {
    throw new Error('`moduleDir` does not exist');
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
    }
    if (!privKeyPath) return;
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
declare global {
  interface Window {
    __signModuleRepo: typeof signModuleRepo;
  }
}
window.__signModuleRepo = signModuleRepo;
