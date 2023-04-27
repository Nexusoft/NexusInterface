//External
import { Component } from 'react';
import styled from '@emotion/styled';
import ReactMarkdown from 'react-markdown';

//Internal
import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import Link from 'components/Link';

//DOCS
import Assets from './ASSETS.MD';
import Finance from './FINANCE.MD';
import Ledger from './LEDGER.MD';
import Names from './NAMES.MD';
import Objects from './OBJECTS.MD';
import Overview from './OVERVIEW.MD';
import Supply from './SUPPLY.MD';
import System from './SYSTEM.MD';
import Tokens from './TOKENS.MD';
import Users from './USERS.MD';
import Invoices from './INVOICES.MD';

const documents = [
  { path: Overview, label: 'Overview' },
  { path: Assets, label: 'Assets' },
  { path: Finance, label: 'Finance' },
  { path: Ledger, label: 'Ledger' },
  { path: Names, label: 'Names' },
  { path: Objects, label: 'Objects' },
  { path: Supply, label: 'Supply' },
  { path: System, label: 'System' },
  { path: Tokens, label: 'Tokens' },
  { path: Users, label: 'Users' },
  { path: Invoices, label: 'Invoices' },
];

const getInnerText = (children) => {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) {
    return children.map((child) => getInnerText(child.props.children)).join('');
  }
  return '';
};

const toHeadingId = (text) =>
  text
    .replace(/\s/g, '-')
    .replace(/[^\d\w]/g, '')
    .toLowerCase();

const CodeBlock = styled.code(({ theme }) => ({
  display: 'block',
  maxWidth: '100%',
  overflow: 'auto',
  border: `1px solid ${theme.mixer(0.125)}`,
  padding: '.5em',
  whiteSpace: 'pre',
}));

const InlineCode = styled.code({
  overflowWrap: 'break-word',
});

class APIDocModal extends Component {
  constructor(props) {
    super(props);
    this.closeModal = null;
    this.state = { displayMD: null };
  }

  loadMD(inFile) {
    fetch(inFile)
      .then((response) => response.text())
      .then((text) => {
        this.setState({ displayMD: text });
      });
  }

  renderDocList = () =>
    documents.map((e) => (
      <div key={e.label}>
        <Button skin={'hyperlink'} onClick={() => this.loadMD(e.path)}>
          {e.label}
        </Button>
        <br />
      </div>
    ));

  render() {
    const { displayMD } = this.state;
    return (
      <ControlledModal
        assignClose={(closeModal) => (this.closeModal = closeModal)}
      >
        <ControlledModal.Header>{'API Documentation'}</ControlledModal.Header>
        <ControlledModal.Body>
          {displayMD ? (
            <ReactMarkdown
              source={this.state.displayMD}
              renderers={{
                link: ({ href, ...rest }) => {
                  return (
                    <Link
                      as="a"
                      href={href}
                      onClick={(evt) => {
                        evt.preventDefault();
                        if (href && href.startsWith('#')) {
                          const element = document.getElementById(
                            href.substring(1)
                          );
                          element.scrollIntoView();
                        }
                      }}
                      {...rest}
                    />
                  );
                },
                heading: ({ level, children, ...rest }) => {
                  const Heading = 'h' + level;
                  return (
                    <Heading id={toHeadingId(getInnerText(children))} {...rest}>
                      {children}
                    </Heading>
                  );
                },
                code: ({ value, ...rest }) => (
                  <CodeBlock {...rest}>{value}</CodeBlock>
                ),
                inlineCode: ({ value, ...rest }) => (
                  <InlineCode {...rest}>{value}</InlineCode>
                ),
              }}
            />
          ) : (
            <>
              <span>{'Documentation'}</span>
              {this.renderDocList()}
            </>
          )}
        </ControlledModal.Body>
        <ControlledModal.Footer>
          <div className="flex space-between">
            {displayMD && (
              <>
                <Button
                  style={{ marginRight: '1em' }}
                  onClick={() => this.setState({ displayMD: null })}
                >
                  {'Back'}
                </Button>
              </>
            )}
            <Button skin="primary" wide onClick={() => this.closeModal()}>
              {__('Close')}
            </Button>
          </div>
        </ControlledModal.Footer>
      </ControlledModal>
    );
  }
}

export default APIDocModal;
