import ModuleDetailsModal from 'components/ModuleDetailsModal';
import { confirm, openErrorDialog, openSuccessDialog } from 'lib/dialog';
import { updateSettings, settingsAtom } from 'lib/settings';
import { store } from 'lib/store';
import { openModal } from 'lib/ui';
import UT from 'lib/usageTracking';

import { moduleDownloadsAtom, modulesMapAtom } from './atoms';
import type { DevModule, ProductionModule } from './rendererModules';

export interface ModuleDownload {
  downloaded?: number;
  totalSize?: number;
  downloading?: boolean;
}

type PendingInstall = {
  token: string;
  module: ProductionModule;
  alreadyInstalled: boolean;
};

let downloadProgressPrepared = false;

export function prepareModuleDownloadProgress() {
  if (downloadProgressPrepared) return;
  downloadProgressPrepared = true;
  window.nexusElectron.modules.onDownloadProgress((progress) => {
    if (!progress || typeof progress.moduleName !== 'string') return;
    store.set(moduleDownloadsAtom, (downloads) => ({
      ...downloads,
      [progress.moduleName]: progress.downloading
        ? {
            downloading: true,
            downloaded: progress.downloaded,
            totalSize: progress.totalSize,
          }
        : null,
    }));
  });
}

async function presentInstall(pending: PendingInstall) {
  return new Promise<void>((resolve) => {
    openModal(ModuleDetailsModal, {
      module: pending.module,
      onClose: resolve,
      install: async () => {
        try {
          let overwrite = false;
          if (pending.alreadyInstalled) {
            overwrite = await confirm({
              question: __('Overwrite module?'),
              note: __('A module with the same directory name already exists'),
            });
            if (!overwrite) return;
          }

          await window.nexusElectron.modules.install({
            token: pending.token,
            overwrite,
          });
          UT.InstallModule(pending.module.info.name);
          resolve();
          openSuccessDialog({
            message: __('Module has been successfully installed'),
            note: __(
              'The wallet will now be refreshed for the new module to take effect'
            ),
            onClose: () => {
              location.reload();
            },
          });
        } catch (error) {
          openErrorDialog({
            message: __('Failed to install module'),
            note: (error as Error)?.message,
          });
        }
      },
    });
  });
}

export async function installModule(source: string) {
  try {
    const pending = (await window.nexusElectron.modules.inspectInstallSource(
      source
    )) as PendingInstall;
    await presentInstall(pending);
  } catch (error) {
    openErrorDialog({
      message: __('Failed to load module'),
      note: (error as Error)?.message,
    });
  }
}

export async function addDevModule(path: string) {
  try {
    const currentSettings = store.get(settingsAtom);
    if (currentSettings.devModulePaths.includes(path)) {
      openErrorDialog({
        message: __('Directory has already been added'),
      });
      return;
    }

    const module = (await window.nexusElectron.modules.addDevelopment(
      path
    )) as DevModule;
    const modules = store.get(modulesMapAtom);
    if (modules[module.info.name]) {
      openErrorDialog({
        message: __('A module with the same name already exists'),
      });
      return;
    }

    updateSettings({
      devModulePaths: [path, ...currentSettings.devModulePaths],
    });
    store.set(modulesMapAtom, {
      ...modules,
      [module.info.name]: module,
    });
    openSuccessDialog({
      message: __('Development module has been added'),
    });
  } catch (error) {
    openErrorDialog({
      message: __('Failed to load development module'),
      note: (error as Error)?.message,
    });
  }
}

export async function downloadAndInstall(request: {
  moduleName: string;
  owner: string;
  repo: string;
  releaseId: number | 'latest';
}) {
  store.set(moduleDownloadsAtom, (downloads) => ({
    ...downloads,
    [request.moduleName]: { downloading: true },
  }));
  try {
    const pending = (await window.nexusElectron.modules.downloadAndInstall(
      request
    )) as PendingInstall;
    await presentInstall(pending);
  } catch (error) {
    openErrorDialog({
      message: __('Error downloading module'),
      note: (error as Error)?.message,
    });
  } finally {
    store.set(moduleDownloadsAtom, (downloads) => ({
      ...downloads,
      [request.moduleName]: null,
    }));
  }
}

export function abortModuleDownload(moduleName: string) {
  void window.nexusElectron.modules.abortDownload(moduleName);
}
