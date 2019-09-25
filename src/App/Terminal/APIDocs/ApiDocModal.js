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

const Documents = [
  { Path: Overview, Display: 'Overview' },
  { Path: Assets, Display: 'Assets' },
  { Path: Finance, Display: 'Finance' },
  { Path: Ledger, Display: 'Ledger' },
  { Path: Names, Display: 'Names' },
  { Path: Objects, Display: 'Objects' },
  { Path: Supply, Display: 'Supply' },
  { Path: System, Display: 'System' },
  { Path: Tokens, Display: 'Tokens' },
  { Path: Users, Display: 'Users' },
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

  DocumentList() {
    return Documents.map(e => {
      return (
        <div key={e.Display}>
          <Button skin={'hyperlink'} onClick={() => this.loadMD(e.Path)}>
            {e.Display}
          </Button>
          <br />
        </div>
      );
    });
  }

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
              {this.DocumentList()}
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
