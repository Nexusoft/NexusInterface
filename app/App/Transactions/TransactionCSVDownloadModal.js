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
    animation:
      percentage >= 100
        ? `pulse 1.25s infinite cubic-bezier(0.66, 0, 0, 1)`
        : null,
    '&::before': {
      content: '""',
      display: 'block',
      background: theme.primary,
      height: '100%',
      width: '100%',
      transformOrigin: 'left center',
      transform: `scaleX(${percentage / 100})`,
      transition: `transform ${timing.normal}`,
    },
  }));

  /**
 * CSV Download Modal
 *
 * @class CSVDownloadModal
 * @extends {PureComponent}
 */
  class CSVDownloadModal extends PureComponent {
     

    render() {
        console.log(this.props);
        return(
        <CSVDownloadModalComponent
        modalRef={this.modalRef}
        assignClose={closeModal => (this.closeModal = closeModal)}
        {...this.props}
        >
            <Modal.Body>
            <Title><Text id="Transactions.CSVDownloadModalTitle"/></Title>
            <ProgressBar percentage={this.props.progress} />
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