// External
import { useRef, useEffect, ComponentProps, ReactNode } from 'react';
import styled from '@emotion/styled';

// Internal
import ControlledModal from 'components/ControlledModal';
import Icon from 'components/Icon';
import * as color from 'utils/color';
import checkIcon from 'icons/check.svg';
import {
  Dialog,
  DialogIcon,
  DialogMessage,
  DialogNote,
  DialogButton,
} from './Dialog';

__ = __context('SuccessDialog');

const CheckMark = styled(DialogIcon)(({ theme }) => ({
  fontSize: 44,
  color: theme.primary,
  borderWidth: 3,
  filter: `drop-shadow(0 0 5px ${color.fade(theme.primary, 0.5)})`,
}));

export type SuccessDialogProps = ComponentProps<typeof Dialog> & {
  message: ReactNode;
  note?: ReactNode;
};

export default function SuccessDialog({
  message,
  note,
  ...rest
}: SuccessDialogProps) {
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
        <CheckMark>
          <Icon icon={checkIcon} />
        </CheckMark>
        <DialogMessage>{message}</DialogMessage>
        {!!note && <DialogNote>{note}</DialogNote>}
      </ControlledModal.Body>
      <DialogButton
        ref={buttonRef}
        skin="filled-primary"
        onClick={() => closeRef.current?.()}
      >
        {__('Dismiss')}
      </DialogButton>
    </Dialog>
  );
}
