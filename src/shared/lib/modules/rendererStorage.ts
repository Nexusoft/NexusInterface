import type { Module } from './rendererModules';

export async function readModuleStorage(module: Module) {
  try {
    return await window.nexusElectron.modules.readStorage(module.info.name);
  } catch (error) {
    console.error(error);
    return {};
  }
}

export async function writeModuleStorage(module: Module, data: unknown) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    console.error('Module storage data must be an object');
    return;
  }
  try {
    await window.nexusElectron.modules.writeStorage(
      module.info.name,
      data as Record<string, unknown>
    );
  } catch (error) {
    console.error(error);
  }
}
