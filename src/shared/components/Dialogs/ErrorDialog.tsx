// External
import { useEffect, useRef, ComponentProps, ReactNode } from 'react';
import styled from '@emotion/styled';

// Internal
import ControlledModal from 'components/ControlledModal';
import * as color from 'utils/color';
import {
  Dialog,
  DialogIcon,
  DialogButton,
  DialogMessage,
  DialogNote,
} from './Dialog';

__ = __context('ErrorDialog');

const XMark = styled(DialogIcon)(({ theme }) => ({
  fontSize: 56,
  color: theme.danger,
  borderWidth: 3,
  filter: `drop-shadow(0 0 5px ${color.fade(theme.danger, 0.5)})`,
}));

export type ErrorDialogProps = ComponentProps<typeof Dialog> & {
  message: ReactNode;
  note?: ReactNode;
};

export default function ErrorDialog({
  message,
  note,
  ...rest
}: ErrorDialogProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<() => void>();
  useEffect(() => {
    buttonRef.current?.focus();
  }, [buttonRef.current]);

  return (
    <Dialog
      assignClose={(closeModal) => {
        closeRef.current = closeModal;
      }}
      {...rest}
    >
      <ControlledModal.Body>
        <XMark>✕</XMark>
        <DialogMessage>{message}</DialogMessage>
        {!!note && <DialogNote>{note}</DialogNote>}
      </ControlledModal.Body>
      <DialogButton
        ref={buttonRef}
        skin="filled-danger"
        onClick={() => closeRef.current?.()}
      >
        {__('Dismiss')}
      </DialogButton>
    </Dialog>
  );
}
