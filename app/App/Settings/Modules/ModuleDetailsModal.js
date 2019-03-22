// External
import React from 'react';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import Icon from 'components/Icon';
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

class ModuleDetailsModal extends React.Component {
  render() {
    const { module } = this.props;
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
                {module.apiVersion}
                {module.deprecated && ' (deprecated)'}
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
          <Field label="Repository">
            {module.repository ? (
              <div>
                <Tooltip.Trigger tooltip={repoUrl}>
                  <ExternalLink href={repoUrl}>
                    <span className="v-align">Visit repository</span>
                    <Icon icon={linkIcon} className="space-left" />
                  </ExternalLink>
                </Tooltip.Trigger>
                {!module.repoOnline && (
                  <Tooltip.Trigger tooltip="Repository does not exist or is private">
                    <Icon icon={warningIcon} className="error space-left" />
                  </Tooltip.Trigger>
                )}
                {!module.repoVerified && (
                  <Tooltip.Trigger tooltip="Module is not verified to be derived from this repository">
                    <Icon icon={warningIcon} className="error space-left" />
                  </Tooltip.Trigger>
                )}
              </div>
            ) : (
              <span className="error">No information</span>
            )}
          </Field>
        </Modal.Body>
      </Modal>
    );
  }
}

export default ModuleDetailsModal;
