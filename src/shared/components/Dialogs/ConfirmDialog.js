// External
import styled from '@emotion/styled';

// Internal
import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import * as color from 'utils/color';
import Dialog from './Dialog';

__ = __context('ConfirmDialog');

const QuestionMark = styled(Dialog.Icon)(({ theme }) => ({
  fontSize: 56,
  color: theme.foreground,
  filter: `drop-shadow(0 0 5px ${color.fade(theme.foreground, 0.5)})`,
}));

const ConfirmationButton = styled(Button)({
  flexGrow: 1,
});

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
}) => (
  <Dialog onBackgroundClick={null} escToClose={false} {...rest}>
    {(closeModal) => (
      <ControlledModal.Body>
        <QuestionMark>?</QuestionMark>
        <Dialog.Message>{question}</Dialog.Message>
        {!!note && <Dialog.Note>{note}</Dialog.Note>}
        <Dialog.Buttons>
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
        </Dialog.Buttons>
      </ControlledModal.Body>
    )}
  </Dialog>
);

export default ConfirmDialog;
