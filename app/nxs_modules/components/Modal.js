// External
import React, { PureComponent } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

// Internal
import Overlay from 'components/Overlay';
import Icon from 'components/Icon';
import { colors, timing } from 'styles';
import { color } from 'utils';

export const ModalContext = React.createContext({
  modalID: null,
  openModal: () => {},
  closeModal: () => {},
  openConfirmModal: () => {},
  openErrorModal: () => {},
});

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

const ModalWrapper = styled.div(
  {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60%',
    maxHeight: '60%',
    background: color.darken(colors.dark, 0.2),
    color: colors.lightGray,
    borderRadius: modalBorderRadius,
    boxShadow: '0 0 20px #000',
    position: 'relative',
    animation: `${intro} ${timing.quick} ease-out`,
  },
  ({ closing }) =>
    closing && {
      animation: `${outtro} ${timing.quick} ease-in`,
    }
);

const ModalHeader = styled.div({
  borderTopLeftRadius: modalBorderRadius,
  borderTopRightRadius: modalBorderRadius,
  padding: '20px 0',
  margin: '0 50px',
  borderBottom: `2px solid ${colors.primary}`,
  color: colors.primary,
  fontSize: 24,
  fontWeight: 'normal',
  textAlign: 'center',
});

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
    if (this.context.modalID && this.context.closeModal) {
      this.setState({ closing: true });
    }
  };

  close = () => {
    this.context.closeModal(this.context.modalID);
  };

  render() {
    const {
      open,
      modalID,
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
        <ModalWrapper
          closing={closing}
          onAnimationEnd={closing ? this.close : undefined}
          {...rest}
        >
          {typeof children === 'function'
            ? children(this.startClosing)
            : children}
        </ModalWrapper>
      </Overlay>
    );
  }
}

Modal.Context = ModalContext;
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
