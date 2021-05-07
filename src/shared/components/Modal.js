/**
 * Important note - This file is imported into module_preload.js, either directly or
 * indirectly, and will be a part of the preload script for modules, therefore:
 * - Be picky with importing stuffs into this file, especially for big
 * files and libraries. The bigger the preload scripts get, the slower the modules
 * will load.
 * - Don't assign anything to `global` variable because it will be passed
 * into modules' execution environment.
 * - Make sure this note also presents in other files which are imported here.
 */

// External
import { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

// Internal
import Overlay from 'components/Overlay';
import { timing } from 'styles';
import { refs } from 'utils/misc';

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
  ({ theme, maxWidth }) => ({
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60%',
    maxHeight: '80%',
    maxWidth: maxWidth,
    background: theme.lower(theme.background, 0.2),
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

export default function Modal({
  visible,
  removeModal,
  onClose,
  fullScreen,
  dimBackground = true,
  escToClose = true,
  onBackgroundClick,
  assignClose,
  modalRef,
  backgroundRef,
  maxWidth,
  children,
  ...rest
}) {
  const modalElem = useRef();
  const backgroundElem = useRef();
  const closeWithAnimation = () =>
    new Promise((resolve) => {
      const duration = parseInt(timing.quick);
      const animation = fullScreen ? fullScreenOutro : outro;
      const options = {
        duration,
        easing: 'ease-in',
        fill: 'both',
      };
      modalElem.current?.animate(animation, options);
      backgroundElem.current?.animate(bgOutro, options);
      setTimeout(() => {
        removeModal();
        resolve();
      }, duration);
    });

  useEffect(() => {
    assignClose?.(closeWithAnimation);
    modalElem.current?.focus();
    return () => {
      onClose?.();
    };
  }, []);

  const handleKeyDown = escToClose
    ? (e) => {
        if (e.key === 'Escape') {
          closeWithAnimation();
        }
      }
    : undefined;

  if (!visible) return null;

  return (
    <Overlay
      dimBackground={dimBackground}
      onBackgroundClick={
        onBackgroundClick === undefined ? closeWithAnimation : onBackgroundClick
      }
      backgroundRef={refs(backgroundElem, backgroundRef)}
      zPriority={fullScreen ? 1 : 0}
    >
      <ModalComponent
        ref={refs(modalElem, modalRef)}
        fullScreen={fullScreen}
        tabIndex="0"
        maxWidth={maxWidth}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {typeof children === 'function'
          ? children(closeWithAnimation)
          : children}
      </ModalComponent>
    </Overlay>
  );
}

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
