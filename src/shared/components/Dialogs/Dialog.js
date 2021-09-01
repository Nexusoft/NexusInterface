import styled from '@emotion/styled';
import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';

const Dialog = styled(ControlledModal)({
  width: 500,
});

Dialog.Icon = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: 80,
  height: 80,
  borderRadius: '50%',
  borderWidth: 2,
  borderStyle: 'solid',
  margin: '0 auto 20px',
});

Dialog.Message = styled.div({
  textAlign: 'center',
  fontSize: 28,
});

Dialog.Note = styled.div({
  textAlign: 'center',
  marginTop: '.5em',
});

Dialog.Buttons = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: 50,
  fontSize: 18,
});

Dialog.Button = styled(Button)({
  gridArea: 'footer',
  width: '100%',
  marginTop: 20,
  fontSize: 22,
  borderRadius: '0 0 4px 4px',
});

export default Dialog;
