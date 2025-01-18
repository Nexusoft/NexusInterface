import { atom } from 'jotai';

export const modulesMapAtom = atom({});
export const moduleStatesAtom = atom({});
export const moduleDownloadsAtom = atom({});
export const failedModulesAtom = atom([]);
export const activeAppModuleNameAtom = atom(null);

export const modulesAtom = atom((get) => Object.values(get(modulesMapAtom)));
export const moduleUpdateCountAtom = atom((get) => {
  const modules = get(modulesAtom);
  return modules ? modules.filter((module) => module.hasNewVersion).length : 0;
});
