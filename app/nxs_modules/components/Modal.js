// External
import React, { PureComponent } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

// Internal
import ModalContext from 'context/modal';
import UIController from 'components/UIController';
import Overlay from 'components/Overlay';
import { timing } from 'styles';
import { color } from 'utils';

const intro = keyframes`
  from { 
    transform: translate(-50%, -50%) scale(0.9);
    opacity: 0 
  }
  to { 
    transform: translate(-50%, -50%) scale(1);
    opacity: 1
  }
`;

const outtro = keyframes`
  from { 
    transform: translate(-50%, -50%) scale(1);
    opacity: 1
  }
  to { 
    transform: translate(-50%, -50%) scale(0.9);
    opacity: 0 
  }
`;

const modalBorderRadius = 4;

const ModalComponent = styled.div(
  ({ theme }) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60%',
    maxHeight: '80%',
    background: color.darken(theme.dark, 0.2),
    color: theme.lightGray,
    borderRadius: modalBorderRadius,
    boxShadow: '0 0 20px #000',
    position: 'relative',
    animation: `${intro} ${timing.quick} ease-out`,
  }),
  ({ closing }) =>
    closing && {
      animation: `${outtro} ${timing.quick} ease-in`,
    }
);

const ModalHeader = styled.div(({ theme }) => ({
  borderTopLeftRadius: modalBorderRadius,
  borderTopRightRadius: modalBorderRadius,
  padding: '20px 0',
  margin: '0 50px',
  borderBottom: `2px solid ${theme.primary}`,
  color: theme.primary,
  fontSize: 24,
  fontWeight: 'normal',
  textAlign: 'center',
}));

const ModalBody = styled.div({
  padding: '30px 50px',
  overflow: 'auto',
});

export default class Modal extends PureComponent {
  static defaultProps = {
    dimBackground: true,
    closeOnBackgroundClick: true,
  };

  static contextType = ModalContext;

  state = {
    closing: false,
  };

  startClosing = () => {
    const modalID = this.context;
    if (modalID) {
      this.setState({ closing: true });
    }
  };

  close = () => {
    const modalID = this.context;
    UIController.closeModal(modalID);
  };

  render() {
    const {
      open,
      dimBackground,
      closeOnBackgroundClick,
      children,
      ...rest
    } = this.props;
    const { closing } = this.state;

    return (
      <Overlay
        dimBackground={this.props.dimBackground}
        onBackgroundClick={
          closeOnBackgroundClick ? this.startClosing : undefined
        }
        closing={closing}
      >
        <ModalComponent
          closing={closing}
          onAnimationEnd={closing ? this.close : undefined}
          {...rest}
        >
          {typeof children === 'function'
            ? children(this.startClosing)
            : children}
        </ModalComponent>
      </Overlay>
    );
  }
}

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
