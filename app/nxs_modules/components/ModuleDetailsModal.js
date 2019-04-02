// External
import React from 'react';
import styled from '@emotion/styled';
import { join } from 'path';

// Internal
import Modal from 'components/Modal';
import Icon from 'components/Icon';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import ExternalLink from 'components/ExternalLink';
import UIController from 'components/UIController';
import config from 'api/configuration';
import { timing } from 'styles';
import deleteDirectory from 'utils/promisified/deleteDirectory';
import warningIcon from 'images/warning.sprite.svg';
import linkIcon from 'images/link.sprite.svg';
import trashIcon from 'images/trash.sprite.svg';

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

const Row = styled.div({
  display: 'grid',
  gridTemplateAreas: '"label value"',
  gridTemplateColumns: '1fr 2fr',
  alignItems: 'start',
  columnGap: '1em',
  marginBottom: '.6em',
});

const Label = styled.div(({ theme }) => ({
  gridArea: 'label',
  textAlign: 'right',
  color: theme.mixer(0.875),
}));

const Value = styled.div({
  gridArea: 'value',
  wordBreak: 'break-word',
});

const Field = ({ label, children }) => (
  <Row>
    <Label>{label}</Label>
    <Value>{children}</Value>
  </Row>
);

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
    UIController.openConfirmDialog({
      question: `Delete ${this.props.module.displayName}?`,
      yesCallback: async () => {
        const moduleDir = join(
          config.GetModulesDir(),
          this.props.module.dirName
        );
        await deleteDirectory(moduleDir);
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
    const { host, owner, repo, commit } = module.repository || {};
    const repoUrl = module.repository
      ? `https://${host}/${owner}/${repo}/tree/${commit}`
      : null;

    return (
      <Modal>
        <Modal.Header className="relative">
          Module Details
          <DeleteModule>
            <DeleteButton skin="plain" onClick={this.confirmDelete}>
              <Icon icon={trashIcon} />
            </DeleteButton>
          </DeleteModule>
        </Modal.Header>
        <Modal.Body>
          <Field label="Module name">{module.name}</Field>
          <Field label="Display name">{module.displayName}</Field>
          <Field label="Module type">{module.type}</Field>
          <Field label="Version">{module.version}</Field>
          <Field label="Nexus Module API version">
            {
              <span className={module.deprecated ? 'error' : undefined}>
                <span className="v-align">{module.apiVersion}</span>
                {module.deprecated && (
                  <span className="error space-left">
                    <Icon icon={warningIcon} />
                    <span className="v-align space-left">(deprecated)</span>
                  </span>
                )}
              </span>
            }
          </Field>
          <Field label="Description">
            {module.description || <span className="dim">Not provided</span>}
          </Field>
          <Field label="Author">
            {module.author ? (
              <div>
                <span>{module.author.name}</span>
                {!!module.author.email && (
                  <span className="space-left">
                    -
                    <ExternalLink
                      className="space-left"
                      href={`mailto:${module.author.email}`}
                    >
                      {module.author.email}
                    </ExternalLink>
                  </span>
                )}
              </div>
            ) : (
              <span className="dim">No information</span>
            )}
          </Field>
          <Field label="Source code">
            {module.repository ? (
              <div>
                <Tooltip.Trigger tooltip={repoUrl}>
                  <ExternalLink href={repoUrl}>
                    <span className="v-align">Visit repository</span>
                    <Icon icon={linkIcon} className="space-left" />
                  </ExternalLink>
                </Tooltip.Trigger>
                {!module.repoOnline && (
                  <div className="error">
                    <Icon icon={warningIcon} />
                    <span className="v-align space-left">
                      Repository does not exist or is private
                    </span>
                  </div>
                )}
                {!module.repoVerified && (
                  <div className="error">
                    <Icon icon={warningIcon} />
                    <span className="v-align space-left">
                      Module is not verified to be derived from this repository
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="error">
                <Icon icon={warningIcon} />
                <span className="v-align space-left">No information</span>
              </div>
            )}
          </Field>
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
const InstallerWrapper = styled.div(({ theme }) => ({
  textAlign: 'center',
  padding: '20px 0',
  margin: '0 50px',
  borderTop: `2px solid ${theme.primary}`,
}));

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
    const btnLabel = module.invalid
      ? 'Module is invalid'
      : installing
      ? 'Installing Module...'
      : 'Install Module';

    return (
      <Modal.Footer>
        <InstallerWrapper>
          {!module.invalid && (
            <InstallerWarning>
              Warning: This module is written by a third party, Nexus is NOT
              responsible for its quality or legitimacy. Please make sure to do
              your due diligence before installing third party modules and use
              them with your own risk.
            </InstallerWarning>
          )}
          <Button
            skin="primary"
            wide
            className="mt1"
            disabled={installing || !!module.invalid}
            onClick={this.install}
          >
            {btnLabel}
          </Button>
        </InstallerWrapper>
      </Modal.Footer>
    );
  }
}
