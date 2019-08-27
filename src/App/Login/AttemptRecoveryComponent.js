// External
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import Button from 'components/Button';
import Panel from 'components/Panel';
import Tooltip from 'components/Tooltip';
import FieldSet from 'components/FieldSet';
import { updateSettings } from 'actions/settings';
import * as Tritium from 'lib/tritiumApi';

const AttemptRecModalComponent = styled(Modal)({
  padding: '1px',
});

const WordInputBox = styled.div({
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'grid',
  alignItems: 'center',
  gridTemplateColumns: 'auto auto auto auto',
  gridTemplateRows: 'auto',
  gridGap: '1em .5em',
  padding: '2em',
  overflowX: 'scroll',
});

const WordInput = styled.input({
  background: 'black',
  textAlign: 'center',
  color: 'white',
  fontWeight: 'bold',
});

class AttemptRecoveryComponent extends React.Component {
  returnWordInputBoxes() {
    let boxes = [];
    for (let index = 0; index < 20; index++) {
      boxes.push(
        <WordInput key={index + 'word'} placeholder={(index + 1).toString()} />
      );
    }
    return <WordInputBox>{boxes}</WordInputBox>;
  }

  closeBack = () => {
    this.props.onCloseBack();
    this.closeModal();
  };

  render() {
    return (
      <AttemptRecModalComponent
        fullScreen
        assignClose={close => {
          this.closeModal = close;
        }}
        {...this.props}
      >
        <Modal.Header>Recovery</Modal.Header>
        <Modal.Body>
          <Panel
            title={'Recovery'}
            controls={
              <Tooltip.Trigger tooltip={'Close'}>
                <Button square skin="primary" onClick={this.closeBack}>
                  {'X'}
                </Button>
              </Tooltip.Trigger>
            }
          >
            <div> {'Instructions'}</div>
            {this.returnWordInputBoxes()}
            <Button
              skin="primary"
              wide
              onClick={this.closeBack}
              style={{ fontSize: 17, padding: '5px' }}
            >
              Recover
            </Button>
            <Button
              skin="primary"
              onClick={this.closeBack}
              style={{ fontSize: 17, padding: '5px' }}
            >
              Cancel
            </Button>
          </Panel>
        </Modal.Body>
      </AttemptRecModalComponent>
    );
  }
}

export default AttemptRecoveryComponent;
