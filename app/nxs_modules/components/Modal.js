// External
import React, { PureComponent } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

// Internal
import ModalContext from 'context/modal';
import UIController from 'components/UIController';
import Overlay from 'components/Overlay';
import { timing, animations } from 'styles';
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

const fullScreenOuttro = keyframes`
  from { 
    transform: scale(1);
    opacity: 1
  }
  to { 
    transform: scale(0.9);
    opacity: 0 
  }
`;

const modalBorderRadius = 4;

const ModalComponent = styled.div(
  ({ theme }) => ({
    position: 'fixed',
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
  ({ fullScreen }) =>
    fullScreen && {
      top: 0,
      left: 0,
      transform: 'none',
      width: '100%',
      height: '100%',
      maxHeight: 'none',
      borderRadius: 0,
      animation: `${animations.fadeIn} ${timing.quick} ease-out`,
    },
  ({ closing, fullScreen }) =>
    closing && {
      animation: `${fullScreen ? fullScreenOuttro : outtro} ${
        timing.quick
      } ease-in`,
    }
);

const ModalLayout = styled.div({
  height: '100%',
  display: 'grid',
  gridTemplateAreas: '"header" "body" "footer"',
  gridTemplateColumns: '1fr',
  gridTemplateRows: 'auto 1fr',
});

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
  gridArea: 'header',
}));

const ModalBody = styled.div({
  padding: '30px 50px',
  overflow: 'auto',
  gridArea: 'body',
});

const ModalFooter = styled.div({
  gridArea: 'footer',
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
    this.props.onClose && this.props.onClose();
  };

  render() {
    const {
      open,
      dimBackground,
      closeOnBackgroundClick,
      onClose,
      fullScreen,
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
          fullScreen={fullScreen}
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

Modal.Layout = ModalLayout;
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
