import { modalSurface } from 'utils/modalStyles';
// External
import styled from '@emotion/styled';

// Internal
import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import * as color from 'utils/color';
import Dialog from './Dialog';
import themeStyles from 'utils/themeStyles';
import { useTheme } from '@emotion/react';

__ = __context('ConfirmDialog');

const QuestionMark = styled(Dialog.Icon)(themeStyles([({
  theme
}) => ({
  fontSize: 56,
  color: theme.foreground,
  filter: `drop-shadow(0 0 5px ${color.fade(theme.foreground, 0.5)})`
})], [({
  theme
}) => ({
  width: 52,
  height: 52,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: color.fade(theme.primary, 0.65),
  background: color.fade(theme.primary, 0.9),
  fontSize: 30,
  fontWeight: 500,
  color: theme.primary,
  margin: '0 auto 20px'
})]));

const ConfirmationSurface = styled(Dialog)(({ theme }) => ({
  width: 'calc(100% - 32px)',
  maxWidth: 500,
  maxHeight: 'calc(100% - 32px)',
  ...modalSurface(theme),
  '&&:focus-visible': { outline: 'none' },
}));

const ConfirmationBody = styled(ControlledModal.Body)({
  margin: 0,
  padding: 24,
  '@media (max-width: 480px)': { padding: 16 },
});

const Message = styled(Dialog.Message)({
  textAlign: 'center', fontSize: 20, fontWeight: 500, lineHeight: 1.3,
  letterSpacing: '-0.4px',
});

const Note = styled(Dialog.Note)(({ theme }) => ({
  textAlign: 'left', fontSize: 14, lineHeight: 1.65,
  marginTop: 12, color: theme.mixer(0.7),
}));

const Actions = styled(Dialog.Buttons)({
  marginTop: 24, gap: 12, fontSize: 13,
  '@media (max-width: 480px)': { flexDirection: 'column' },
});

const ConfirmationButton = styled(Button)(themeStyles([{
  flexGrow: 1
}], [({
  theme,
  skin
}) => ({
  flexGrow: 1,
  minHeight: 44,
  height: 'auto',
  padding: '10px 16px',
  borderRadius: 10,
  whiteSpace: 'normal',
  lineHeight: 1.4,
  ...(skin === 'filled-primary' && {
    background: theme.primary,
    color: theme.primaryAccent,
    '&:hover': {
      background: color.lighten(theme.primary, 0.1),
      color: theme.primaryAccent
    }
  })
})]));

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
}) => {
  const { modern } = useTheme();
  return modern ? (<ConfirmationSurface onBackgroundClick={null} escToClose={false} {...rest}>
    {(closeModal) => (
      <ConfirmationBody>
        <QuestionMark>?</QuestionMark>
        <Message>{question}</Message>
        {!!note && <Note>{note}</Note>}
        <Actions>
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
            skin={skinYes === 'primary' ? 'filled-primary' : skinYes}
            onClick={() => {
              callbackYes && callbackYes();
              closeModal();
            }}
          >
            {labelYes}
          </ConfirmationButton>
        </Actions>
      </ConfirmationBody>
    )}
  </ConfirmationSurface>) : (<Dialog onBackgroundClick={null} escToClose={false} {...rest}>
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
  </Dialog>);
};

export default ConfirmDialog;
