//External
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';
import ReactDom from 'react-dom';
import ReactMarkdown from 'react-markdown';

//Internal
import Modal from 'components/Modal';
import Button from 'components/Button';

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
];

class APIDocModal extends React.Component {
  constructor(props) {
    super(props);
    this.closeModal = null;
    this.state = { displayMD: null };
  }

  loadMD(inFile) {
    fetch(inFile)
      .then(response => response.text())
      .then(text => {
        this.setState({ displayMD: text });
      });
  }

  renderDocList = () =>
    documents.map(e => (
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
      <Modal assignClose={closeModal => (this.closeModal = closeModal)}>
        <Modal.Header>{'API Documentation'}</Modal.Header>
        <Modal.Body>
          {displayMD ? (
            <ReactMarkdown source={this.state.displayMD} />
          ) : (
            <>
              <span>{'Documentation'}</span>
              {this.renderDocList()}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <div className="flex space-between">
            {displayMD ? (
              <>
                <Button
                  style={{ marginRight: '1em' }}
                  onClick={() => this.setState({ displayMD: null })}
                >
                  {'Back'}
                </Button>
              </>
            ) : null}
            <Button skin="primary" wide onClick={() => this.closeModal()}>
              {__('Close')}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default APIDocModal;
