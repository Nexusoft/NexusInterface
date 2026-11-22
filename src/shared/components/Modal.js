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
import { fade } from 'utils/color';
import { modalLayout, modalSurface, modalAction, modalField } from 'utils/modalStyles';

const intro = keyframes`
  from {
    transform: translate(-50%, -50%) scale(calc(var(--modal-scale, 1) * 0.9));
    opacity: 0 
  }
  to {
    transform: translate(-50%, -50%) scale(var(--modal-scale, 1));
    opacity: 1
  }
`;

const outro = {
  transform: [
    'translate(-50%, -50%) scale(var(--modal-scale, 1))',
    'translate(-50%, -50%) scale(calc(var(--modal-scale, 1) * 0.9))',
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
    transform: 'translate(-50%, -50%) scale(var(--modal-scale, 1))',
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
    boxSizing: 'border-box',
    '@media (max-width: 640px)': {
      width: 'calc(100vw - 24px)',
      maxWidth: 'calc(100vw - 24px)',
    },
  }),
  ({ theme, maxWidth }) => theme.modern && {
    width: 'min(720px, calc(100vw - 32px))',
    maxWidth: maxWidth ? `min(${typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth}, calc(100vw - 32px))` : 'calc(100vw - 32px)',
    maxHeight: 'calc(100vh - 32px)',
    minWidth: 0,
    ...modalSurface(theme),
    gridTemplateRows: 'auto minmax(0, 1fr) auto',
    overflow: 'hidden',
    fontSize: 14,
    lineHeight: 1.6,
    'label': { marginBottom: 8, fontSize: 12, letterSpacing: '0.2px', textTransform: 'none', color: theme.mixer(0.7) },
    '&& [data-wallet-field]': modalField(theme),
    '&& [data-modal-action="true"]': modalAction,
    'form > .flex:last-child': { marginTop: 24, gap: 12, flexWrap: 'wrap' },
    'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), select, textarea': {
      borderRadius: 10,
      fontSize: 14,
    },
    'button': { borderRadius: 10 },
    '[data-form-field]': { marginTop: 20 },
    'form > [data-form-field]:first-of-type': { marginTop: 0 },
    '[data-info-field]': { gridTemplateColumns: 'minmax(110px, 1fr) minmax(0, 3fr)', gap: 16, margin: 0, padding: '14px 0', borderBottom: `1px solid ${fade(theme.primary, 0.9)}` },
    '[data-info-label]': { textAlign: 'left', fontSize: 12, color: theme.mixer(0.6) },
    '[data-info-value]': { minWidth: 0, fontSize: 13, color: theme.foreground, overflowWrap: 'anywhere' },
    '.modal-fee': { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '14px 16px', marginTop: 20, borderRadius: 12, background: fade(theme.primary, 0.95), border: `1px solid ${fade(theme.primary, 0.85)}`, fontSize: 13 },
    '.modal-actions': { display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 10, marginTop: 24, paddingTop: 20, borderTop: `1px solid ${fade(theme.primary, 0.85)}` },
    '.modal-actions > button': { width: 'auto', margin: 0 },
    '.modal-hint': { margin: '10px 0 0', fontSize: 12, lineHeight: 1.6, color: theme.mixer(0.6) },
    '@media (max-width: 520px)': { '[data-info-field]': { gridTemplateColumns: 'minmax(0, 1fr)', gridTemplateAreas: '\"label\" \"value\"', gap: 6 }, '.modal-actions > button': { flex: '1 1 auto' } },

    '.flex.space-between': { gap: 12, flexWrap: 'wrap' },
    '@media (max-height: 800px), (max-width: 640px)': {
      fontSize: 13,
      lineHeight: 1.45,
      '&& [data-modal-header]': { padding: '12px 16px', margin: 0 },
      '&& [data-modal-body]': { padding: 16, margin: 0 },
      '&& [data-modal-footer]': { padding: '12px 16px', margin: 0 },
      '&& [data-modal-header] h2': { fontSize: 22 },
      '&& .registry-modal-icon': { width: 36, height: 36, borderRadius: 10 },
      '&& .registry-modal-title': { fontSize: 18 },
      '&& [data-info-field]': { padding: '9px 0', gap: 10 },
      '&& [data-form-field]': { marginTop: 12 },
      '&& [data-wallet-field]': { minHeight: 38 },
      '&& [data-wallet-field][data-multiline="true"]': { minHeight: 80 },
      '&& .modal-actions': { marginTop: 16, paddingTop: 12 },
    },
    '@media (max-width: 480px)': { borderRadius: 14 },
  },
  // Scale the whole dialog, including custom content with fixed pixel sizes.
  // Expand its layout height by the same factor so scaling reveals more content.
  ({ fullScreen, maxWidth }) => !fullScreen && {
    '--modal-scale': 1,
    '@media (max-width: 1280px), (max-height: 850px)': {
      '--modal-scale': 0.9,
      '&&': { maxHeight: 'calc(88vh / 0.9)', maxWidth: maxWidth ? `min(${typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth}, calc((100vw - 32px) / 0.9))` : 'calc((100vw - 32px) / 0.9)' },
    },
    '@media (max-width: 1050px), (max-height: 700px)': {
      '--modal-scale': 0.85,
      '&&': { maxHeight: 'calc(88vh / 0.85)', maxWidth: maxWidth ? `min(${typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth}, calc((100vw - 24px) / 0.85))` : 'calc((100vw - 24px) / 0.85)' },
    },
    '@media (max-height: 520px)': {
      '--modal-scale': 0.75,
      '&&': { maxHeight: 'calc(90vh / 0.75)', maxWidth: maxWidth ? `min(${typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth}, calc((100vw - 20px) / 0.75))` : 'calc((100vw - 20px) / 0.75)' },
    },
  },
  ({ fullScreen }) =>
    fullScreen && {
      top: 0,
      left: 0,
      transform: 'none',
      width: '100%',
      height: '100%',
      maxHeight: 'none',
      maxWidth: 'none',
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
  ...(theme.modern && {
    '&&': { padding: modalLayout.headerPadding, margin: 0, fontSize: modalLayout.titleSize, fontWeight: 500, borderBottom: `1px solid ${fade(theme.primary, 0.85)}` },
    padding: modalLayout.headerPadding,
    margin: 0,
    borderBottom: `1px solid ${fade(theme.primary, 0.85)}`,
    textAlign: 'left',
    fontSize: modalLayout.titleSize,
    fontWeight: 500,
    lineHeight: 1.3,
    letterSpacing: '-0.4px',
    overflowWrap: 'anywhere',
    '@media (max-width: 480px)': { '&&': { padding: modalLayout.mobilePadding } },
  }),
}));

const ModalBody = styled.div(({ theme }) => ({
  padding: '0 50px',
  margin: '30px 0',
  overflow: 'auto',
  gridArea: 'body',
  minHeight: 0,
  minWidth: 0,
  ...(theme.modern && {
    '&&': { padding: modalLayout.bodyPadding, margin: 0 },
    padding: modalLayout.bodyPadding,
    margin: 0,
    minWidth: 0,
    minHeight: 0,
    overscrollBehavior: 'contain',
    overflowWrap: 'anywhere',
    '@media (max-width: 480px)': { '&&': { padding: modalLayout.mobilePadding } },
  }),
}));

const ModalFooter = styled.div(
  {
    gridArea: 'footer',
    padding: '20px 0',
    margin: '0 50px',
  },
  ({ theme, separator }) =>
    separator && {
      borderTop: `2px solid ${theme.primary}`,
    },
  ({ theme, separator }) => theme.modern && {
    margin: 0,
    padding: modalLayout.footerPadding,
    borderTop: separator ? `1px solid ${fade(theme.primary, 0.85)}` : undefined,
    '@media (max-width: 480px)': { padding: modalLayout.mobilePadding },
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
  portalContainer,
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
      portalContainer={portalContainer}
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

ModalHeader.defaultProps = { 'data-modal-header': true };
ModalBody.defaultProps = { 'data-modal-body': true };
ModalFooter.defaultProps = { 'data-modal-footer': true };

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
