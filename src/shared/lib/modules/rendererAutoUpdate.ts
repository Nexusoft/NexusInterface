import { store } from 'lib/store';
import { showNotification } from 'lib/ui';
import { navigate } from 'lib/wallet';

import { modulesMapAtom } from './atoms';
import type { Module } from './rendererModules';

export async function checkForModuleUpdates() {
  try {
    const updates = (await window.nexusElectron.modules.checkUpdates()) as Array<{
      moduleName: string;
      latestVersion: string;
      latestRelease: {
        id: number;
        tag_name: string;
        assets: boolean;
      };
    }>;
    if (!Array.isArray(updates)) return;

    if (updates.length > 0) {
      showNotification(
        __(
          'Update available for %{smart_count} module |||| Updates available for %{smart_count} modules',
          updates.length
        ),
        {
          type: 'success',
          onClick: (closeNotif) => {
            navigate('/Settings/Modules');
            closeNotif();
          },
        }
      );
    }

    store.set(modulesMapAtom, (modules) => {
      const nextModules = { ...modules };
      updates.forEach(({ moduleName, latestVersion, latestRelease }) => {
        const module = nextModules[moduleName] as Module | undefined;
        if (!module || module.development) return;
        nextModules[moduleName] = {
          ...module,
          hasNewVersion: true,
          latestVersion,
          latestRelease,
        };
      });
      return nextModules;
    });
  } catch (error) {
    console.error(error);
  }
}
