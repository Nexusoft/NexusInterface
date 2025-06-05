// External
import { useState } from 'react';
import styled from '@emotion/styled';
import { useAtomValue } from 'jotai';

// Internal
import ControlledModal, {
  ControlledModalProps,
} from 'components/ControlledModal';
import Icon from 'components/Icon';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import InfoField from 'components/InfoField';
import ExternalLink from 'components/ExternalLink';
import SimpleProgressBar from 'components/SimpleProgressBar';
import UT from 'lib/usageTracking';
import { confirm } from 'lib/dialog';
import { navigate } from 'lib/wallet';
import { updateSettings, settingAtoms } from 'lib/settings';
import {
  downloadAndInstall,
  abortModuleDownload,
  moduleDownloadsAtom,
  isDevModule,
  Module,
  ProductionModule,
  DevModule,
} from 'lib/modules';
import { timing } from 'styles';
import { store } from 'lib/store';
import { rm as deleteDirectory } from 'fs/promises';

import warningIcon from 'icons/warning.svg';
import linkIcon from 'icons/link.svg';
import trashIcon from 'icons/trash.svg';
import updateIcon from 'icons/update.svg';
import closeIcon from 'icons/x-circle.svg';
import { removeUpdateCache } from 'lib/modules/autoUpdate';

__ = __context('ModuleDetails');

const DeleteModule = styled.div({
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  fontSize: '1rem',
});

const DeleteButton = styled.div(({ theme }) => ({
  cursor: 'pointer',
  color: theme.mixer(0.25),
  transition: `color ${timing.normal}`,
  '&:hover': {
    color: theme.danger,
  },
}));

const CheckMark = styled.span({
  cursor: 'default',
  userSelect: 'none',
});

async function confirmDelete(module: Module) {
  const confirmed = await confirm({
    question: `Delete ${module.info.displayName}?`,
  });
  if (confirmed) {
    if (module.development) {
      const devModulePaths = store.get(settingAtoms.devModulePaths);
      updateSettings({
        devModulePaths: devModulePaths.filter((path) => path !== module.path),
      });
    } else {
      await deleteDirectory(module.path, { recursive: true, force: true });
      removeUpdateCache(module.repository);
      UT.UninstallModule(module.info.name);
    }
    location.reload();
  }
}

function ProductionModuleDetails({
  module,
  install,
  closeModal,
}: {
  module: ProductionModule;
  install?: () => Promise<void>;
  closeModal: () => void;
}) {
  const moduleInfo = module.info;
  const { host, owner, repo, commit } = module.repository || {};
  const repoUrl = module.repository
    ? `https://${host}/${owner}/${repo}/tree/${commit}`
    : null;
  const moduleDownloads = useAtomValue(moduleDownloadsAtom);
  const downloadInfo = moduleDownloads[moduleInfo.name];
  const { downloaded, totalSize } = downloadInfo || {};
  const downloadProgress =
    (downloaded && totalSize && downloaded / totalSize) || 0;
  const downloadRequest = downloadInfo?.downloadRequest;
  // `downloading` -> when the module package is being downloaded
  // `busy` -> when the module package is being downloaded OR is in other preparation steps
  const downloading = !!downloadRequest;
  const busy = !!downloadInfo;

  return (
    <>
      <InfoField ratio={[1, 2]} label={__('Version')}>
        {moduleInfo.version || <span className="dim">N/A</span>}
      </InfoField>
      <InfoField ratio={[1, 2]} label={__('Target wallet version')}>
        {
          <span className={module.incompatible ? 'error' : undefined}>
            <span className="v-align">
              {moduleInfo.targetWalletVersion || (
                <span className="dim">N/A</span>
              )}
            </span>
            {module.incompatible && (
              <span className="error ml0_4">
                <Icon icon={warningIcon} />
                <span className="v-align ml0_4">({__('incompatible')})</span>
              </span>
            )}
          </span>
        }
      </InfoField>
      <InfoField ratio={[1, 2]} label={__('Description')}>
        {moduleInfo.description || <span className="dim">N/A</span>}
      </InfoField>
      <InfoField ratio={[1, 2]} label={__('Author')}>
        {moduleInfo.author ? (
          <div>
            <span>{moduleInfo.author.name}</span>
            {!!moduleInfo.author.email && (
              <span className="ml0_4">
                -
                <ExternalLink
                  className="ml0_4"
                  href={`mailto:${moduleInfo.author.email}`}
                >
                  {moduleInfo.author.email}
                </ExternalLink>
              </span>
            )}
          </div>
        ) : (
          <span className="dim">N/A</span>
        )}
      </InfoField>
      {!module.development && (
        <InfoField ratio={[1, 2]} label={__('Source code')}>
          {module.repository ? (
            <div>
              {repoUrl && (
                <Tooltip.Trigger tooltip={repoUrl}>
                  <ExternalLink href={repoUrl}>
                    <span className="v-align">{__('Visit repository')}</span>
                    <Icon icon={linkIcon} className="ml0_4" />
                  </ExternalLink>
                </Tooltip.Trigger>
              )}

              {module.repoOnline &&
                module.repoVerified &&
                module.repoFromNexus && (
                  <Tooltip.Trigger
                    tooltip={__('This module is developed by Nexus')}
                  >
                    <CheckMark>&nbsp;&nbsp;✔</CheckMark>
                  </Tooltip.Trigger>
                )}

              {!module.repoOnline && (
                <div className="error">
                  <Icon icon={warningIcon} />
                  <span className="v-align ml0_4">
                    {__('This repository does not exist or is private')}
                  </span>
                </div>
              )}
              {!module.repoVerified && (
                <div className="error">
                  <Icon icon={warningIcon} />
                  <span className="v-align ml0_4">
                    {__(
                      'This repository is not verified to be the real source code of this module'
                    )}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className={module.development ? 'dim' : 'error'}>
              <span className="v-align">N/A</span>
              {!module.development && (
                <Icon icon={warningIcon} className="ml0_4" />
              )}
            </div>
          )}
        </InfoField>
      )}
      {!module.development && (
        <InfoField ratio={[1, 2]} label={__('Module hash')}>
          {module.hash ? (
            <span className="monospace">{module.hash}</span>
          ) : (
            <span className="dim">N/A</span>
          )}
        </InfoField>
      )}

      {!install && module.info.type === 'app' && (
        <div className="mt2 flex space-between">
          {module.hasNewVersion ? (
            <div className="flex">
              {downloading ? (
                <>
                  <SimpleProgressBar
                    label={__('Downloading %{percentage}%...', {
                      percentage: Math.round(downloadProgress * 100),
                    })}
                    progress={downloadProgress}
                    width={200}
                  />
                  <Tooltip.Trigger tooltip={__('Cancel download')}>
                    <Button
                      skin="plain-danger"
                      className="ml1"
                      onClick={() => abortModuleDownload(module.info.name)}
                    >
                      <Icon icon={closeIcon} />
                    </Button>
                  </Tooltip.Trigger>
                </>
              ) : (
                <>
                  <Button
                    skin="primary"
                    onClick={() => {
                      if (!module.repository) return;
                      downloadAndInstall({
                        moduleName: moduleInfo.name,
                        owner: module.repository.owner,
                        repo: module.repository.repo,
                        releaseId: 'latest',
                      });
                    }}
                    disabled={busy}
                  >
                    <Icon icon={updateIcon} className="mr0_4" />
                    <span className="v-align">
                      {__('Update to %{version}', {
                        version: 'v' + module.latestVersion,
                      })}
                    </span>
                  </Button>
                </>
              )}
              <div className="ml2 flex center">
                {module.latestRelease && (
                  <ExternalLink
                    href={`https://${host}/${owner}/${repo}/releases/tag/${module.latestRelease.tag_name}`}
                  >
                    <span className="v-align mr0_4">
                      {__('View the release')}
                    </span>
                    <Icon icon={linkIcon} />
                  </ExternalLink>
                )}
              </div>
            </div>
          ) : (
            <div />
          )}
          <Button
            skin="primary"
            onClick={() => {
              closeModal();
              navigate('/Modules/' + module.info.name);
            }}
          >
            {__('Open App')}
          </Button>
        </div>
      )}

      {!!install && <Installer module={module} install={install} />}
    </>
  );
}

function DevModuleDetails({
  module,
  closeModal,
}: {
  module: DevModule;
  closeModal: () => void;
}) {
  return (
    <>
      {module.development && (
        <InfoField ratio={[1, 2]} label={__('Entry')}>
          {module.info.entry}
        </InfoField>
      )}
      <div className="mt2 flex space-between">
        <Button
          skin="primary"
          onClick={() => {
            closeModal();
            navigate('/Modules/' + module.info.name);
          }}
        >
          {__('Open App')}
        </Button>
      </div>
    </>
  );
}

/**
 * Module details modal, for viewing details of both installed modules
 * and modules being installed
 */
export default function ModuleDetailsModal({
  module,
  install,
  ...rest
}: ControlledModalProps & {
  module: Module;
  install?: () => Promise<void>;
}) {
  const moduleInfo = module.info;

  return (
    <ControlledModal {...rest}>
      {(closeModal) => (
        <>
          <ControlledModal.Header className="relative">
            {__('Module Details')}
            {!install && (
              <DeleteModule>
                <Tooltip.Trigger tooltip={__('Remove module')}>
                  <DeleteButton onClick={() => confirmDelete(module)}>
                    <Icon icon={trashIcon} />
                  </DeleteButton>
                </Tooltip.Trigger>
              </DeleteModule>
            )}
          </ControlledModal.Header>
          <ControlledModal.Body>
            <InfoField ratio={[1, 2]} label={__('Module name')}>
              {moduleInfo.name}
            </InfoField>
            <InfoField ratio={[1, 2]} label={__('Display name')}>
              {moduleInfo.displayName}
            </InfoField>
            <InfoField ratio={[1, 2]} label={__('Module type')}>
              {moduleInfo.type}
              {module.development && (
                <span className="ml0_4">
                  &#x28;{__('in development')}&#x29;
                </span>
              )}
            </InfoField>
          </ControlledModal.Body>

          {isDevModule(module) ? (
            <DevModuleDetails module={module} closeModal={closeModal} />
          ) : (
            <ProductionModuleDetails {...{ module, install, closeModal }} />
          )}
        </>
      )}
    </ControlledModal>
  );
}

/**
 * Module Installer
 * =============================================================================
 */

const InstallerWarning = styled.div({
  fontSize: '.9em',
});

/**
 * Install section at the bottom of Module Details modal
 */
function Installer({
  install,
  module,
}: {
  install: () => Promise<void>;
  module: ProductionModule;
}) {
  const [installing, setInstalling] = useState(false);

  const doInstall = async () => {
    setInstalling(true);
    try {
      await install();
    } finally {
      setInstalling(false);
    }
  };

  const btnLabel = module.disallowed
    ? __('Module is disallowed')
    : installing
    ? __('Installing Module...')
    : __('Install Module');

  return (
    <ControlledModal.Footer separator style={{ textAlign: 'center' }}>
      {!module.disallowed &&
        !(module.repoOnline && module.repoVerified && module.repoFromNexus) && (
          <InstallerWarning>
            {__(`Warning: This module is written by a third party, Nexus is NOT
              responsible for its quality or legitimacy. Please make sure to do
              your due diligence before installing third party modules and use
              them with your own risk.`)}
          </InstallerWarning>
        )}
      <Button
        skin="primary"
        wide
        className="mt1"
        disabled={installing || !!module.disallowed}
        onClick={doInstall}
      >
        {btnLabel}
      </Button>
    </ControlledModal.Footer>
  );
}
