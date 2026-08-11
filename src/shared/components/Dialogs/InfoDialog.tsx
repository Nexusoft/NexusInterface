// External
import { ComponentProps, useRef, useEffect, ReactNode } from 'react';
import styled from '@emotion/styled';

// Internal
import ControlledModal from 'components/ControlledModal';
import Icon from 'components/Icon';
import * as color from 'utils/color';
import infoIcon from 'icons/info.svg';
import {
  Dialog,
  DialogIcon,
  DialogMessage,
  DialogNote,
  DialogButton,
} from './Dialog';

__ = __context('InfoDialog');

const InfoMark = styled(DialogIcon)(({ theme }) => ({
  fontSize: 44,
  color: theme.mixer(0.75),
  borderWidth: 3,
  filter: `drop-shadow(0 0 5px ${color.fade(theme.mixer(0.75), 0.5)})`,
}));

export type InfoDialogProps = ComponentProps<typeof Dialog> & {
  message: ReactNode;
  note?: ReactNode;
};

export default function InfoDialog({
  message,
  note,
  ...rest
}: InfoDialogProps) {
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
        <InfoMark>
          <Icon icon={infoIcon} />
        </InfoMark>
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
