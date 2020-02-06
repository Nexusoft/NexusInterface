// External
import React from 'react';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import Icon from 'components/Icon';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import InfoField from 'components/InfoField';
import ExternalLink from 'components/ExternalLink';
import { openConfirmDialog } from 'lib/ui';
import { updateSettings } from 'lib/settings';
import { timing } from 'styles';
import store from 'store';
import deleteDirectory from 'utils/promisified/deleteDirectory';
import warningIcon from 'icons/warning.svg';
import linkIcon from 'icons/link.svg';
import trashIcon from 'icons/trash.svg';

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

/**
 * Module details modal, for viewing details of both installed modules
 * and modules being installed
 *
 * @class ModuleDetailsModal
 * @extends {React.Component}
 */
class ModuleDetailsModal extends React.Component {
  /**
   *
   *
   * @memberof ModuleDetailsModal
   */
  confirmDelete = () => {
    const { module } = this.props;
    openConfirmDialog({
      question: `Delete ${module.info.displayName}?`,
      callbackYes: async () => {
        if (module.development) {
          const { devModulePaths } = store.getState().settings;
          updateSettings({
            devModulePaths: devModulePaths.filter(path => path !== module.path),
          });
        } else {
          await deleteDirectory(module.path);
        }
        location.reload();
      },
    });
  };

  /**
   *
   *
   * @returns
   * @memberof ModuleDetailsModal
   */
  render() {
    const { module, forInstall, install } = this.props;
    const moduleInfo = module.info;
    const { host, owner, repo, commit } = module.repository || {};
    const repoUrl = module.repository
      ? `https://${host}/${owner}/${repo}/tree/${commit}`
      : null;
    return (
      <Modal>
        <Modal.Header className="relative">
          {__('Module Details')}
          {!forInstall && (
            <DeleteModule>
              <Tooltip.Trigger tooltip={__('Remove module')}>
                <DeleteButton skin="plain" onClick={this.confirmDelete}>
                  <Icon icon={trashIcon} />
                </DeleteButton>
              </Tooltip.Trigger>
            </DeleteModule>
          )}
        </Modal.Header>
        <Modal.Body>
          <InfoField ratio={[1, 2]} label={__('Module name')}>
            {moduleInfo.name}
          </InfoField>
          <InfoField ratio={[1, 2]} label={__('Display name')}>
            {moduleInfo.displayName}
          </InfoField>
          <InfoField ratio={[1, 2]} label={__('Module type')}>
            {moduleInfo.type}
          </InfoField>
          <InfoField ratio={[1, 2]} label={__('Version')}>
            {moduleInfo.version || 'N/A'}
          </InfoField>
          <InfoField ratio={[1, 2]} label={__('Target wallet version')}>
            {
              <span className={module.incompatible ? 'error' : undefined}>
                <span className="v-align">
                  {moduleInfo.targetWalletVersion || 'N/A'}
                </span>
                {module.incompatible && (
                  <span className="error space-left">
                    <Icon icon={warningIcon} />
                    <span className="v-align space-left">
                      ({__('incompatible')})
                    </span>
                  </span>
                )}
              </span>
            }
          </InfoField>
          <InfoField ratio={[1, 2]} label={__('Description')}>
            {moduleInfo.description || (
              <span className="dim">{__('Not provided')}</span>
            )}
          </InfoField>
          <InfoField ratio={[1, 2]} label={__('Author')}>
            {moduleInfo.author ? (
              <div>
                <span>{moduleInfo.author.name}</span>
                {!!moduleInfo.author.email && (
                  <span className="space-left">
                    -
                    <ExternalLink
                      className="space-left"
                      href={`mailto:${moduleInfo.author.email}`}
                    >
                      {moduleInfo.author.email}
                    </ExternalLink>
                  </span>
                )}
              </div>
            ) : (
              <span className="dim">{__('No information')}</span>
            )}
          </InfoField>
          <InfoField ratio={[1, 2]} label={__('Source code')}>
            {module.repository ? (
              <div>
                <Tooltip.Trigger tooltip={repoUrl}>
                  <ExternalLink href={repoUrl}>
                    <span className="v-align">{__('Visit repository')}</span>
                    <Icon icon={linkIcon} className="space-left" />
                  </ExternalLink>
                </Tooltip.Trigger>

                {module.repoVerified && module.repoFromNexus && (
                  <Tooltip.Trigger
                    tooltip={__('This module is developed by Nexus')}
                  >
                    <CheckMark>&nbsp;&nbsp;✔</CheckMark>
                  </Tooltip.Trigger>
                )}

                {!module.repoOnline && (
                  <div className="error">
                    <Icon icon={warningIcon} />
                    <span className="v-align space-left">
                      {__('This repository does not exist or is private')}
                    </span>
                  </div>
                )}
                {!module.repoVerified && (
                  <div className="error">
                    <Icon icon={warningIcon} />
                    <span className="v-align space-left">
                      {__(
                        'This repository is not verified to be the real source code of this module'
                      )}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="error">
                <Icon icon={warningIcon} />
                <span className="v-align space-left">
                  {__('No information')}
                </span>
              </div>
            )}
          </InfoField>
          <InfoField ratio={[1, 2]} label={__('Module hash')}>
            {module.hash ? (
              <span className="monospace">{module.hash}</span>
            ) : (
              <span className="dim">{__('Not available')}</span>
            )}
          </InfoField>
        </Modal.Body>

        {!!forInstall && <Installer module={module} install={install} />}
      </Modal>
    );
  }
}

export default ModuleDetailsModal;

/**
 * Module Installer
 * =============================================================================
 */

const InstallerWarning = styled.div({
  fontSize: '.9em',
});

/**
 * Install section at the bottom of Module Details modal
 *
 * @class Installer
 * @extends {React.Component}
 */
class Installer extends React.Component {
  state = {
    installing: false,
  };

  /**
   *
   *
   * @memberof Installer
   */
  install = async () => {
    this.setState({ installing: true });
    try {
      await this.props.install();
    } finally {
      this.setState({ installing: false });
    }
  };

  /**
   *
   *
   * @returns
   * @memberof Installer
   */
  render() {
    const { module } = this.props;
    const { installing } = this.state;
    const btnLabel = module.disallowed
      ? __('Module is disallowed')
      : installing
      ? __('Installing Module...')
      : __('Install Module');

    return (
      <Modal.Footer separator style={{ textAlign: 'center' }}>
        {!module.disallowed && !(module.repoVerified && module.repoFromNexus) && (
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
          onClick={this.install}
        >
          {btnLabel}
        </Button>
      </Modal.Footer>
    );
  }
}
