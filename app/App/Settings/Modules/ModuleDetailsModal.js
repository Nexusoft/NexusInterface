// External
import React from 'react';
import styled from '@emotion/styled';
import { shell } from 'electron';

// Internal
import Modal from 'components/Modal';
import ExternalLink from 'components/ExternalLink';

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
          <Field label="Nexus Module API version">{module.apiVersion}</Field>
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
                <ExternalLink href={repoUrl}>{repoUrl}</ExternalLink>
              </div>
            ) : (
              <span className="dim">No information</span>
            )}
          </Field>
        </Modal.Body>
      </Modal>
    );
  }
}

export default ModuleDetailsModal;
