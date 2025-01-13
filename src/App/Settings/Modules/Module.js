// External
import { useSelector } from 'react-redux';
import { useAtomValue } from 'jotai';
import styled from '@emotion/styled';

// Internal
import ModuleIcon from 'components/ModuleIcon';
import ExternalIcon from 'components/ExternalIcon';
import Switch from 'components/Switch';
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import Button from 'components/Button';
import SimpleProgressBar from 'components/SimpleProgressBar';
import { openModal } from 'lib/ui';
import { confirm } from 'lib/dialog';
import ModuleDetailsModal from 'components/ModuleDetailsModal';
import { timing } from 'styles';
import { updateSettings, settingsAtom } from 'lib/settings';
import { downloadAndInstall, abortModuleDownload } from 'lib/modules';
import warningIcon from 'icons/warning.svg';
import downloadIcon from 'icons/download.svg';
import closeIcon from 'icons/x-circle.svg';

import FeaturedModuleDetailsModal from './FeaturedModuleDetailsModal';

__ = __context('Settings.Modules');

const ModuleComponent = styled.div(
  ({ theme }) => ({
    display: 'grid',
    gridTemplateAreas: '"logo info controls"',
    gridTemplateColumns: 'min-content 1fr min-content',
    columnGap: '1em',
    alignItems: 'center',
    padding: '1em 0',
    borderBottom: `1px solid ${theme.mixer(0.125)}`,
    opacity: 0.8,
    transition: `opacity ${timing.normal}`,
    '&:hover': {
      opacity: 1,
    },
  }),
  ({ last }) =>
    last && {
      borderBottom: 'none',
    }
);

const ModuleLogo = styled.div(
  ({ unclickable }) =>
    !unclickable && {
      cursor: 'pointer',
    },
  {
    fontSize: '2em',
  }
);

const ModuleInfo = styled.div(
  {
    gridArea: 'info',
  },
  ({ unclickable }) =>
    !unclickable && {
      cursor: 'pointer',
    }
);

const ModuleControls = styled.div({
  gridArea: 'controls',
  display: 'flex',
  alignItems: 'center',
});

const ModuleName = styled.span(({ theme }) => ({
  color: theme.foreground,
  verticalAlign: 'middle',
}));

const ModuleVersion = styled.span(({ theme }) => ({
  color: theme.mixer(0.75),
  fontSize: '.9em',
  marginLeft: '.7em',
  verticalAlign: 'middle',
}));

const ModuleDescription = styled.div(({ theme }) => ({
  color: theme.mixer(0.75),
  fontSize: '.9em',
}));

const Badge = styled.div(({ theme }) => ({
  textTransform: 'uppercase',
  fontSize: '.75em',
  color: theme.mixer(0.875),
  background: theme.mixer(0.05),
  padding: '.2em .6em',
  borderRadius: 4,
  whiteSpace: 'nowrap',
  flexShrink: 0,
  marginLeft: '1em',
  cursor: 'default',
  userSelect: 'none',
}));

const LatestVersion = styled.span(({ theme }) => ({
  color: theme.primary,
  verticalAlign: 'middle',
  marginLeft: '.7em',
  fontSize: '.9em',
}));

export default function Module({ module, ...rest }) {
  const { disabledModules } = useAtomValue(settingsAtom);

  const enableModule = () => {
    updateSettings(
      'disabledModules',
      disabledModules.filter((moduleName) => moduleName !== module.info.name)
    );
  };

  const disableModule = () => {
    updateSettings('disabledModules', [...disabledModules, module.info.name]);
  };

  const toggleModule = async () => {
    if (module.disallowed) return;

    if (module.enabled) {
      const confirmed = await confirm({
        question: __('Disable %{moduleName}?', {
          moduleName: module.info.displayName,
        }),
        note: __(
          'Wallet will be automatically refreshed for the change to take effect'
        ),
      });
      if (confirmed) {
        disableModule();
        document.location.reload();
      }
    } else {
      const confirmed = await confirm({
        question: __('Enable %{moduleName}?', {
          moduleName: module.info.displayName,
        }),
        note: __(
          'Wallet will be automatically refreshed for the change to take effect'
        ),
      });
      if (confirmed) {
        enableModule();
        document.location.reload();
      }
    }
  };

  const openModuleDetails = () => {
    openModal(ModuleDetailsModal, {
      module,
    });
  };

  return (
    <ModuleComponent {...rest}>
      <ModuleLogo
        className={module.disallowed ? 'dim' : undefined}
        onClick={openModuleDetails}
      >
        <ModuleIcon module={module} />
      </ModuleLogo>

      <ModuleInfo onClick={openModuleDetails}>
        <div className={module.disallowed ? 'dim' : undefined}>
          <ModuleName>{module.info.displayName}</ModuleName>
          {!!module.info.version && (
            <ModuleVersion>v{module.info.version}</ModuleVersion>
          )}
          {!module.development && (
            <>
              {module.incompatible && (
                <Tooltip.Trigger
                  tooltip={__(
                    'This module was built for an incompatible wallet version'
                  )}
                >
                  <Icon icon={warningIcon} className="error ml0_4" />
                </Tooltip.Trigger>
              )}
              {(!module.repository || !module.repoOnline) && (
                <Tooltip.Trigger tooltip={__('Module is not open source')}>
                  <Icon icon={warningIcon} className="error ml0_4" />
                </Tooltip.Trigger>
              )}
              {!!module.repository && !module.repoVerified && (
                <Tooltip.Trigger
                  tooltip={__(
                    'The provided repository is not verified to be the real source code of this module'
                  )}
                >
                  <Icon icon={warningIcon} className="error ml0_4" />
                </Tooltip.Trigger>
              )}
              {module.hasNewVersion && (
                <LatestVersion>
                  {__('%{version} update available', {
                    version: 'v' + module.latestVersion,
                  })}
                </LatestVersion>
              )}
            </>
          )}
        </div>

        <div>
          <ModuleDescription className={module.disallowed ? 'dim' : undefined}>
            {module.info.description}
          </ModuleDescription>
        </div>
      </ModuleInfo>

      <ModuleControls>
        {module.development ? (
          <Badge>{__('development')}</Badge>
        ) : (
          <Tooltip.Trigger
            tooltip={
              !module.disallowed &&
              !module.development &&
              (module.enabled ? 'Enabled' : 'Disabled')
            }
          >
            <Switch
              checked={module.enabled}
              onChange={toggleModule}
              disabled={module.disallowed || module.development}
            />
          </Tooltip.Trigger>
        )}
      </ModuleControls>
    </ModuleComponent>
  );
}

Module.FeaturedModule = function ({ featuredModule, ...rest }) {
  const moduleDownload = useSelector(
    (state) => state.moduleDownloads[featuredModule.name]
  );
  // `downloading` -> when the module package is being downloaded
  // `busy` -> when the module package is being downloaded OR is in other preparation steps
  const busy = useSelector(
    (state) => !!state.moduleDownloads[featuredModule.name]
  );
  const { downloaded, totalSize, downloading } = moduleDownload || {};
  const downloadProgress = downloaded / totalSize;

  const openModuleDetails = () => {
    openModal(FeaturedModuleDetailsModal, {
      featuredModule,
    });
  };

  return (
    <ModuleComponent {...rest}>
      <ModuleLogo unclickable>
        <ExternalIcon url={featuredModule.icon} />
      </ModuleLogo>

      <ModuleInfo onClick={openModuleDetails}>
        <div>
          <ModuleName>{featuredModule.displayName}</ModuleName>
        </div>

        <div>
          <ModuleDescription>{featuredModule.description}</ModuleDescription>
        </div>
      </ModuleInfo>

      <ModuleControls>
        {downloading ? (
          <>
            <Tooltip.Trigger tooltip={__('Cancel download')}>
              <Button
                skin="plain-danger"
                className="mr1"
                onClick={abortModuleDownload}
              >
                <Icon icon={closeIcon} />
              </Button>
            </Tooltip.Trigger>
            <SimpleProgressBar
              label={__('Downloading %{percentage}%...', {
                percentage: Math.round(downloadProgress * 100),
              })}
              progress={downloadProgress}
              width={200}
            />
          </>
        ) : (
          <Button
            skin="default"
            uppercase
            onClick={() => {
              downloadAndInstall({
                moduleName: featuredModule.name,
                owner: featuredModule.repoInfo.owner,
                repo: featuredModule.repoInfo.repo,
                releaseId: 'latest',
              });
            }}
            disabled={busy}
          >
            <Icon icon={downloadIcon} className="mr0_4" />
            <span className="v-align">{__('Install')}</span>
          </Button>
        )}
      </ModuleControls>
    </ModuleComponent>
  );
};
