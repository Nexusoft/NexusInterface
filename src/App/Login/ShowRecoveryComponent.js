// External
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';
//import ReactToPrint from 'react-to-print';

// Internal
import Modal from 'components/Modal';
import Button from 'components/Button';
import Panel from 'components/Panel';
import { updateSettings } from 'actions/settings';
import * as Tritium from 'lib/tritiumApi';
import {
  openConfirmDialog,
  openModal,
  openErrorDialog,
} from 'actions/overlays';
import PrintRecovery from './PrintRecovery';

const ShowRecModalComponent = styled(Modal)({
  padding: '1px',
  WebkitUserSelect: 'none',
  WebkitUserDrag: 'none',
});

const WordBox = styled.div({
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'grid',
  alignItems: 'center',
  gridTemplateColumns: 'auto auto auto auto',
  gridTemplateRows: 'auto',
  gridGap: '1em .5em',
  padding: '2em',
});

const Word = styled.div({
  background: 'black',
  textAlign: 'center',
  color: 'white',
  fontWeight: 'bold',
});

class ShowRecoveryComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      twentyWords: [],
    };
  }

  componentDidMount() {
    this.setState({
      twentyWords: [
        'one',
        'two',
        'three',
        'four',
        'five',
        'six',
        'seven',
        'eight',
        'nine',
        'ten',
        'eleven',
        'twelve',
        'thirteen',
        'forteen',
        'fifteen',
        'sixteen',
        'seventeen',
        'eighteen',
        'nineteen',
        'twnety',
      ],
    });
  }

  returnWords() {
    return this.state.twentyWords.map(e => {
      return <Word key={e}>{e}</Word>;
    });
  }

  print() {}

  askToContinue = () => {
    openConfirmDialog({
      question:
        'Are you sure you want to continue? You will not be shown these words again.',
      skinYes: 'danger',
      callbackYes: () => {
        this.props.onCloseBack();
        this.closeModal();
      },
    });
  };

  render() {
    return (
      <ShowRecModalComponent
        fullScreen
        assignClose={close => {
          this.closeModal = close;
        }}
        {...this.props}
        oncopy={'return false'}
        onpaste={'return false'}
      >
        <Modal.Header>Recovery</Modal.Header>
        <Modal.Body>
          <Panel title={'Show Recovery'}>
            <div> {'Instructions'}</div>
            <WordBox>{this.returnWords()}</WordBox>
            <Button
              skin="primary"
              onClick={this.askToContinue}
              style={{ fontSize: 17, padding: '5px' }}
            >
              Continue
            </Button>
            {/*<ReactToPrint
              trigger={() => (
                <Button
                  skin="primary"
                  onClick={() => this.print()}
                  style={{ fontSize: 17, padding: '5px' }}
                >
                  Print
                </Button>
              )}
              content={() => this.printRef}
              />*/}{' '}
            {/*In order to print we print the whole compoenent, this component is styled for printing and is hidden*/}
            {/*Change style to display: hidden , must be done as a parent, if you display hidden PrintRecovery the print is blank*/}
            <div style={{ display: 'block' }}>
              <PrintRecovery
                twentyWords={this.state.twentyWords}
                ref={e => (this.printRef = e)}
                {...this.props}
              />
            </div>
          </Panel>
        </Modal.Body>
      </ShowRecModalComponent>
    );
  }
}

export default ShowRecoveryComponent;
