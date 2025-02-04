import { atom } from 'jotai';
import { ModuleDownload } from './installModule';
import { FailedModule, Module } from './module';

export const modulesMapAtom = atom<Record<string, Module>>({});
export const moduleStatesAtom = atom<Record<string, Object>>({});
export const moduleDownloadsAtom = atom<Record<string, ModuleDownload | null>>(
  {}
);
export const failedModulesAtom = atom<FailedModule[]>([]);
export const activeAppModuleNameAtom = atom<string | null>(null);

export const modulesAtom = atom((get) => Object.values(get(modulesMapAtom)));
export const moduleUpdateCountAtom = atom((get) => {
  const modules = get(modulesAtom);
  return modules
    ? modules.filter((module: any) => module.hasNewVersion).length
    : 0;
});
