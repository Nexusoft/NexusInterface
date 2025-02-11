// External
import { useAtomValue } from 'jotai';
import styled from '@emotion/styled';
import { shell } from 'electron';

// Internal
import { settingsAtom } from 'lib/settings';
import { failedModulesAtom, modulesAtom } from 'lib/modules';
import { timing } from 'styles';
import Tooltip from 'components/Tooltip';

import { useSettingsTab } from '../atoms';
import Module from './Module';
import AddModule from './AddModule';
import AddDevModule from './AddDevModule';
import FeaturedModules from './FeaturedModules';
import SectionSeparator from './SectionSeparator';

__ = __context('Settings.Modules');

const FailedModules = styled.div(({ theme }) => ({
  borderTop: `1px solid ${theme.mixer(0.125)}`,
  marginTop: '2em',
}));

const FailedModule = styled.div(({ theme }) => ({
  padding: '1em 0',
  fontSize: '.9em',
  color: theme.mixer(0.75),
  cursor: 'pointer',
  opacity: 0.8,
  transition: `opacity ${timing.normal}`,
  '&:hover': {
    opacity: 1,
  },
}));

export default function SettingsModules() {
  useSettingsTab('Modules');
  const modules = useAtomValue(modulesAtom);
  const failedModules = useAtomValue(failedModulesAtom);
  const { devMode } = useAtomValue(settingsAtom);

  return (
    <>
      <AddModule />
      {devMode && <AddDevModule />}
      <SectionSeparator label={__('Installed modules')} />
      {modules.map((module, i) => (
        <Module
          key={module.info.name}
          module={module}
          last={i === modules.length - 1}
        />
      ))}
      {failedModules?.length > 0 && (
        <FailedModules>
          {failedModules.map(({ name, path, message }) => (
            <FailedModule
              key={name}
              onClick={() => {
                shell.openPath(path);
              }}
            >
              <Tooltip.Trigger tooltip={message}>
                <span>
                  {__('Failed to load %{moduleName}', { moduleName: name })}
                </span>
              </Tooltip.Trigger>
            </FailedModule>
          ))}
        </FailedModules>
      )}
      {!modules.length && !failedModules.length && (
        <div className="text-center dim mt3 mb3">
          <em>{__('No modules have been installed')}</em>
        </div>
      )}
      <FeaturedModules />
    </>
  );
}
