// External
import React, { PureComponent } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

// Internal
import ModalContext from 'context/modal';
import Overlay from 'components/Overlay';
import { timing } from 'styles';
import { passRef } from 'utils/misc';
import * as color from 'utils/color';

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

const outro = {
  transform: [
    'translate(-50%, -50%) scale(1)',
    'translate(-50%, -50%) scale(0.9)',
  ],
  opacity: [1, 0],
};

const bgOutro = {
  opacity: [1, 0],
};

const fullScreenIntro = keyframes`
  from { 
    transform: scale(0.9);
    opacity: 0
  }
  to { 
    transform: scale(1);
    opacity: 1 
  }
`;

const fullScreenOutro = {
  transform: ['scale(1)', 'scale(0.9)'],
  opacity: [1, 0],
};

const modalBorderRadius = 4;

const ModalComponent = styled.div(
  ({ theme }) => ({
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60%',
    maxHeight: '80%',
    background: color.darken(theme.background, 0.2),
    color: theme.mixer(0.75),
    borderRadius: modalBorderRadius,
    boxShadow: '0 0 20px #000',
    animation: `${intro} ${timing.quick} ease-out`,
    animationFillMode: 'both',
    display: 'grid',
    gridTemplateAreas: '"header" "body" "footer"',
    gridTemplateColumns: '1fr',
    gridTemplateRows: 'auto 1fr auto',
    outline: 'none',
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
      animation: `${fullScreenIntro} ${timing.quick} ease-out`,
    },
  ({ closing, fullScreen }) =>
    closing && {
      animation: `${fullScreen ? fullScreenOutro : outro} ${
        timing.quick
      } ease-in`,
    }
);

const ModalHeader = styled.div(({ theme }) => ({
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
  padding: '0 50px',
  margin: '30px 0',
  overflow: 'auto',
  gridArea: 'body',
});

const ModalFooter = styled.div(
  {
    gridArea: 'footer',
    padding: '20px 0',
    margin: '0 50px',
  },
  ({ theme, separator }) =>
    separator && {
      borderTop: `2px solid ${theme.primary}`,
    }
);

/**
 * Modal Component
 *
 * @export
 * @class Modal
 * @extends {PureComponent}
 */
export default class ModuleModal extends PureComponent {
  static defaultProps = {
    dimBackground: true,
    escToClose: true,
  };

  static contextType = ModalContext;

  /**
   *Creates an instance of Modal.
   * @param {*} props
   * @memberof Modal
   */
  constructor(props) {
    super(props);
    props.assignClose && props.assignClose(this.animatedClose);
  }

  componentDidMount() {
    this.modalElem.focus();
  }

  componentWillUnmount() {
    if (this.props.onClose) this.props.onClose();
  }

  /**
   * Animate the Close event
   *
   * @memberof Modal
   */
  animatedClose = () => {
    const modalID = this.context;
    if (true) {
      console.log(modalID);
      const duration = parseInt(timing.quick);
      const animation = this.props.fullScreen ? fullScreenOutro : outro;
      const options = {
        duration,
        easing: 'ease-in',
        fill: 'both',
      };
      this.modalElem.animate(animation, options);
      this.backgroundElem.animate(bgOutro, options);
      setTimeout(this.remove, duration);
    }
  };

  /**
   * Remove Modal
   *
   * @memberof Modal
   */
  remove = () => {
    const modalID = this.context;
    //removeModal(modalID);
    console.log(this.props);

    this.props.removeModal();
  };

  /**
   * Pass Ref of this modal to state
   *
   * @memberof Modal
   */
  modalRef = el => {
    this.modalElem = el;
    if (this.props.modalRef) {
      passRef(el, this.props.modalRef);
    }
  };

  /**
   * Pass Background Ref of this modal to state
   *
   * @memberof Modal
   */
  backgroundRef = el => {
    this.backgroundElem = el;
    if (this.props.backgroundRef) {
      passRef(el, this.props.backgroundRef);
    }
  };

  handleKeyDown = e => {
    if (this.props.escToClose && e.key === 'Escape') {
      this.animatedClose();
    }
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Modal
   */
  render() {
    const {
      open,
      dimBackground,
      onBackgroundClick = this.animatedClose,
      onClose,
      fullScreen,
      children,
      assignClose,
      modalRef,
      backgroundRef,
      escToClose,
      ...rest
    } = this.props;

    return (
      <Overlay
        dimBackground={this.props.dimBackground}
        onBackgroundClick={onBackgroundClick}
        backgroundRef={this.backgroundRef}
        zPriority={fullScreen ? 1 : 0}
      >
        <ModalComponent
          ref={this.modalRef}
          fullScreen={fullScreen}
          tabIndex="0"
          onKeyDown={this.handleKeyDown}
          {...rest}
        >
          {typeof children === 'function'
            ? children(this.animatedClose)
            : children}
        </ModalComponent>
      </Overlay>
    );
  }
}

ModuleModal.Header = ModalHeader;
ModuleModal.Body = ModalBody;
ModuleModal.Footer = ModalFooter;
