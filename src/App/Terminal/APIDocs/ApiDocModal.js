//External
import { Component } from 'react';
import styled from '@emotion/styled';
import ReactMarkdown from 'react-markdown';

//Internal
import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import Link from 'components/Link';

//DOCS
import Overview from './API/OVERVIEW.MD';
import Filtering from './API/FILTERING.MD';
import Sorting from './API/SORTING.MD';
import Queries from './API/QUERIES.MD';
import Operators from './API/OPERATORS.MD';
import Templates from './API/TEMPLATES.MD';

import Assets from './API/COMMANDS/ASSETS.MD';
import Finance from './API/COMMANDS/FINANCE.MD';
import Invoices from './API/COMMANDS/INVOICES.MD';
import Ledger from './API/COMMANDS/LEDGER.MD';
import Market from './API/COMMANDS/MARKET.MD';
import Names from './API/COMMANDS/NAMES.MD';
import Profiles from './API/COMMANDS/PROFILES.MD';
import Register from './API/COMMANDS/REGISTER.MD';
import Sessions from './API/COMMANDS/SESSIONS.MD';
import Supply from './API/COMMANDS/SUPPLY.MD';
import System from './API/COMMANDS/SYSTEM.MD';

//DEPRECATED DOCS
import DepAssets from './DEPRECATED/ASSETS.MD';
import DepFinance from './DEPRECATED/FINANCE.MD';
import DepLedger from './DEPRECATED/LEDGER.MD';
import DepNames from './DEPRECATED/NAMES.MD';
import DepObjects from './DEPRECATED/OBJECTS.MD';
import DepSupply from './DEPRECATED/SUPPLY.MD';
import DepSystem from './DEPRECATED/SYSTEM.MD';
import DepTokens from './DEPRECATED/TOKENS.MD';
import DepUsers from './DEPRECATED/USERS.MD';
import DepInvoices from './DEPRECATED/INVOICES.MD';

const documents = [
  { path: Overview, label: 'Overview' },
  { path: Filtering, label: 'Filtering' },
  { path: Sorting, label: 'Sorting' },
  { path: Queries, label: 'Queries' },
  { path: Operators, label: 'Operators' },
  { path: Templates, label: 'Templates' },
  { path: Assets, label: 'Commands/Assets' },
  { path: Finance, label: 'Commands/Finance' },
  { path: Invoices, label: 'Commands/Invoices' },
  { path: Ledger, label: 'Commands/Ledger' },
  { path: Market, label: 'Commands/Market' },
  { path: Names, label: 'Commands/Names' },
  { path: Profiles, label: 'Commands/Profiles' },
  { path: Register, label: 'Commands/Register' },
  { path: Sessions, label: 'Commands/Sessions' },
  { path: Supply, label: 'Commands/Supply' },
  { path: System, label: 'Commands/System' },
  { path: DepAssets, label: 'Deprecated/Assets' },
  { path: DepFinance, label: 'Deprecated/Finance' },
  { path: DepLedger, label: 'Deprecated/Ledger' },
  { path: DepNames, label: 'Deprecated/Names' },
  { path: DepObjects, label: 'Deprecated/Objects' },
  { path: DepSupply, label: 'Deprecated/Supply' },
  { path: DepSystem, label: 'Deprecated/System' },
  { path: DepTokens, label: 'Deprecated/Tokens' },
  { path: DepUsers, label: 'Deprecated/Users' },
  { path: DepInvoices, label: 'Deprecated/Invoices' },
];

const getInnerText = (children) => {
  if (!children) return '';
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) {
    return children
      .map((child) => {
        return getInnerText(child?.props?.children || child);
      })
      .join('');
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

  Headers = ({ level, children, ...rest }) => {
    const Heading = 'h' + level;
    const innerText = getInnerText(children);
    return <Heading id={toHeadingId(innerText)}>{innerText}</Heading>;
  };

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
              skipHtml={true}
              components={{
                // TODO: Links to places outside of the loaded MD do not work
                a: ({ href, ...rest }) => {
                  return (
                    <Link
                      as="a"
                      href={href}
                      onClick={(evt) => {
                        evt.preventDefault();
                        if (href && href.startsWith('#')) {
                          const element = document.getElementById(
                            toHeadingId(href.substring(1))
                          );
                          element.scrollIntoView();
                        }
                      }}
                      {...rest}
                    />
                  );
                },
                h1: this.Headers,
                h2: this.Headers,
                h3: this.Headers,
                h4: this.Headers,
                h5: this.Headers,
                h6: this.Headers,
                code: ({ inline, ...props }) =>
                  inline ? <InlineCode {...props} /> : <CodeBlock {...props} />,
              }}
            >
              {displayMD}
            </ReactMarkdown>
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
