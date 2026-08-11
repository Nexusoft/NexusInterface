// External
import { ReactNode, ComponentProps } from 'react';
import styled from '@emotion/styled';

// Internal
import ControlledModal from 'components/ControlledModal';
import Button, { ButtonSkin } from 'components/Button';
import * as color from 'utils/color';
import {
  Dialog,
  DialogIcon,
  DialogMessage,
  DialogNote,
  DialogButtons,
} from './Dialog';

__ = __context('ConfirmDialog');

const QuestionMark = styled(DialogIcon)(({ theme }) => ({
  fontSize: 56,
  color: theme.foreground,
  filter: `drop-shadow(0 0 5px ${color.fade(theme.foreground, 0.5)})`,
}));

const ConfirmationButton = styled(Button)({
  flexGrow: 1,
});

export interface ConfirmDialogProps extends ComponentProps<typeof Dialog> {
  question: ReactNode;
  note?: ReactNode;
  labelYes?: ReactNode;
  skinYes?: ButtonSkin;
  callbackYes?: () => void;
  labelNo?: ReactNode;
  skinNo?: ButtonSkin;
  callbackNo?: () => void;
}

const ConfirmDialog = ({
  question,
  note,
  labelYes = __('Yes'),
  skinYes = 'primary',
  callbackYes,
  labelNo = __('No'),
  skinNo = 'default',
  callbackNo,
  ...rest
}: ConfirmDialogProps) => (
  <Dialog onBackgroundClick={undefined} escToClose={false} {...rest}>
    {(closeModal) => (
      <ControlledModal.Body>
        <QuestionMark>?</QuestionMark>
        <DialogMessage>{question}</DialogMessage>
        {!!note && <DialogNote>{note}</DialogNote>}
        <DialogButtons>
          <ConfirmationButton
            skin={skinNo}
            onClick={() => {
              callbackNo && callbackNo();
              closeModal();
            }}
          >
            {labelNo}
          </ConfirmationButton>
          <ConfirmationButton
            className="ml1"
            skin={skinYes}
            onClick={() => {
              callbackYes && callbackYes();
              closeModal();
            }}
          >
            {labelYes}
          </ConfirmationButton>
        </DialogButtons>
      </ControlledModal.Body>
    )}
  </Dialog>
);

export default ConfirmDialog;
