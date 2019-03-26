// External
import React from 'react';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import Icon from 'components/Icon';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import ExternalLink from 'components/ExternalLink';
import warningIcon from 'images/warning.sprite.svg';
import linkIcon from 'images/link.sprite.svg';

const Line = styled.div({
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
  <Line>
    <Label>{label}</Label>
    <Value>{children}</Value>
  </Line>
);

const InstallerWrapper = styled.div(({ theme }) => ({
  textAlign: 'center',
  padding: '20px 0',
  margin: '0 50px',
  borderTop: `2px solid ${theme.primary}`,
}));

const InstallerWarning = styled.div({
  fontSize: '.9em',
});

class Installer extends React.Component {
  state = {
    installing: false,
  };

  render() {
    const { installing } = this.state;

    return (
      <Modal.Footer>
        <InstallerWrapper>
          <InstallerWarning>
            Warning: This module is written by a third party, Nexus is NOT
            responsible for its quality or legitimacy. Please make sure to do
            your due diligence before installing third party modules and use
            them with your own risk.
          </InstallerWarning>
          <Button
            skin="primary"
            wide
            className="mt1"
            disabled={installing || !!module.invalid}
          >
            {installing ? 'Installing Module...' : 'Install Module'}
          </Button>
        </InstallerWrapper>
      </Modal.Footer>
    );
  }
}

class ModuleDetailsModal extends React.Component {
  render() {
    const { module, forInstall } = this.props;
    const { host, owner, repo, commit } = module.repository || {};
    const repoUrl = module.repository
      ? `https://${host}/${owner}/${repo}/tree/${commit}`
      : null;

    return (
      <Modal>
        <Modal.Header>Module Details</Modal.Header>
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

        {!!forInstall && <Installer module={module} />}
      </Modal>
    );
  }
}

export default ModuleDetailsModal;
