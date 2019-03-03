// External
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

// Internal
import Modal from 'components/Modal';
import Button from 'components/Button';
import UIController from 'components/UIController';
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import ModalContext from 'context/modal';
import Text from 'components/Text';
import { timing } from 'styles';

const CSVDownloadModalComponent = styled(Modal)(
    ({ maximizedFromBackground }) =>
      maximizedFromBackground && {
        animation: `${maximizeAnimation} ${timing.quick} linear`,
      }
  );

  const Title = styled.div({
    fontSize: 28,
  });

const ProgressBar = styled.div(({ percentage, theme }) => ({
    height: 20,
    borderRadius: 10,
    border: `1px solid ${theme.mixer(0.5)}`,
    overflow: 'hidden',
    
    '&::before': {
      content: '""',
      display: 'block',
      background: theme.primary,
      height: '100%',
      width: '100%',
      transformOrigin: 'left center',
      transform: `scaleX(${percentage / 100})`,
    },
  }));

  /**
 * CSV Download Modal
 *
 * @class CSVDownloadModal
 * @extends {PureComponent}
 */
  class CSVDownloadModal extends PureComponent {

    constructor(props) {
      super(props);
      this.props.parent({progress: this.updateProgress.bind(this)})
    }
    state = {
        processProgress: 0,
      }

    updateProgress(inNum)
    {
      this.setState(
        {
          processProgress: inNum,
        }
      );
    }

    render() {
        return(
        <CSVDownloadModalComponent
        assignClose={closeModal => (this.closeModal = closeModal)}
        {...this.props}
        >
            <Modal.Body>
            <Title><Text id="Transactions.CSVDownloadModalTitle"/></Title>
            <ProgressBar percentage={this.state.processProgress} />
            <Button
                skin="danger" onClick={() => this.closeModal()}>
              <Text id="Transactions.CSVDownloadModalCancel"/>
            </Button>
            </Modal.Body>
        </CSVDownloadModalComponent>
        );
    }
        
  }
  
export default CSVDownloadModal;