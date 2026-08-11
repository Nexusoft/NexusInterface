import { store } from 'lib/store';

import { failedModulesAtom, modulesMapAtom } from './atoms';
import { checkForModuleUpdates } from './rendererAutoUpdate';
import { prepareModuleDownloadProgress } from './rendererInstall';

export interface Repository {
  type: 'git';
  host: 'github.com';
  owner: string;
  repo: string;
  commit: string;
}

export interface ModuleInfo {
  name: string;
  displayName: string;
  version: string;
  targetWalletVersion?: string;
  specVersion?: string;
  description?: string;
  type: 'app';
  entry?: string;
  icon?: string;
  author?: {
    name?: string;
    email?: string;
  };
  files: string[];
}

export interface DevModuleInfo {
  name: string;
  displayName: string;
  description?: string;
  type: 'app';
  entry?: string;
  icon?: string;
}

export interface ProductionModule {
  development?: false;
  info: ModuleInfo;
  hash?: string;
  repository?: Repository;
  incompatible: boolean;
  disallowed: boolean;
  repoOnline: boolean;
  repoVerified: boolean;
  repoFromNexus: boolean;
  enabled: boolean;
  hasNewVersion?: boolean;
  latestVersion?: string;
  latestRelease?: {
    id: number;
    tag_name: string;
    assets: boolean;
  };
}

export interface DevModule {
  development: true;
  path: string;
  info: DevModuleInfo;
  enabled: boolean;
}

export type Module = ProductionModule | DevModule;

export interface FailedModule {
  name: string;
  message: string;
}

export function isDevModule(module: Module): module is DevModule {
  return module.development === true;
}

export async function prepareModules() {
  try {
    const result = (await window.nexusElectron.modules.list()) as {
      modules?: Module[];
      failedModules?: FailedModule[];
    };
    const modules = Array.isArray(result?.modules) ? result.modules : [];
    const modulesMap = modules.reduce<Record<string, Module>>((map, module) => {
      if (module?.info?.name && !map[module.info.name]) {
        map[module.info.name] = module;
      }
      return map;
    }, {});

    store.set(modulesMapAtom, modulesMap);
    store.set(
      failedModulesAtom,
      Array.isArray(result?.failedModules) ? result.failedModules : []
    );
    prepareModuleDownloadProgress();
    void checkForModuleUpdates();
  } catch (error) {
    console.error(error);
  }
}
