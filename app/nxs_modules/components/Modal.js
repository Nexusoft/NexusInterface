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
  openModal: () => {},
  closeModal: () => {},
});

const intro = keyframes`
  from { 
    transform: translate(-50%, -50%) scale(0.92);
    opacity: 0.66 
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
    transform: translate(-50%, -50%) scale(0.92);
    opacity: 0.66 
  }
`;

const modalBorderRadius = 4;

const ModalWrapper = styled.div(
  {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '60%',
    maxHeight: '60%',
    background: color.darken(colors.dark, 0.2),
    color: colors.lightGray,
    borderRadius: modalBorderRadius,
    boxShadow: '0 0 20px #000',
    position: 'relative',
    animation: `${intro} ${timing.normal} ease-out`,
  },
  ({ closing }) =>
    closing && {
      animation: `${outtro} ${timing.normal} ease-out`,
    }
);

const ModalHeader = styled.div({
  borderTopLeftRadius: modalBorderRadius,
  borderTopRightRadius: modalBorderRadius,
  padding: '15px 0',
  margin: '0 30px',
  borderBottom: `1px solid ${colors.primary}`,
  color: colors.primary,
  fontSize: 24,
  fontWeight: 'normal',
  textAlign: 'center',
});

const ModalBody = styled.div({
  padding: '15px 30px',
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
    this.setState({ closing: true });
  };

  close = () => {
    this.context.closeModal(this.props.modalID);
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
          closeOnBackgroundClick ? this.context.closeCurrentModal : undefined
        }
      >
        <ModalWrapper
          closing={closing}
          onAnimationEnd={closing ? this.close : undefined}
        >
          {typeof children === 'function'
            ? children(this.startClosing)
            : children}
        </ModalWrapper>
      </Overlay>
    );
  }
}

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
