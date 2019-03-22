// External
import React from 'react';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import Link from 'components/Link';

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
                <div>{module.author.name}</div>
                {!!module.author.email && (
                  <div>
                    <Link
                      as="a"
                      target="_blank"
                      href={`mailto:${module.author.email}`}
                    >
                      {module.author.email}
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <span className="dim">No information</span>
            )}
          </Field>
          <Field label="Repository">
            {module.repository ? (
              <div>
                <Link as="a" target="_blank" href={repoUrl}>
                  {repoUrl}
                </Link>
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
