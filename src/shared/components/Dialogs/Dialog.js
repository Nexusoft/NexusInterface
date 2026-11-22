import styled from '@emotion/styled';
import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import { fade } from 'utils/color';

const Dialog = styled(ControlledModal)({
  width: 500,
});

Dialog.Icon = styled.div(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: 80,
  height: 80,
  borderRadius: '50%',
  borderWidth: 2,
  borderStyle: 'solid',
  margin: '0 auto 20px',
  ...(theme.modern && {
    width: 52, height: 52, borderRadius: 16, borderWidth: 1,
    background: fade(theme.primary, 0.9), borderColor: fade(theme.primary, 0.65),
  }),
}));

Dialog.Message = styled.div(({ theme }) => ({
  textAlign: 'center',
  fontSize: 28,
  ...(theme.modern && {
    fontSize: 20, fontWeight: 500, lineHeight: 1.35,
    letterSpacing: '-0.4px', overflowWrap: 'anywhere',
  }),
}));

Dialog.Note = styled.div(({ theme }) => ({
  textAlign: 'center',
  marginTop: '.5em',
  ...(theme.modern && {
    marginTop: 12, fontSize: 14, lineHeight: 1.65,
    color: theme.mixer(0.7), overflowWrap: 'anywhere',
  }),
}));

Dialog.Buttons = styled.div(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: 50,
  fontSize: 18,
  ...(theme.modern && {
    marginTop: 24, gap: 12, fontSize: 14, flexWrap: 'wrap',
    '> button': { minHeight: 44, height: 'auto', padding: '10px 16px', whiteSpace: 'normal' },
    '@media (max-width: 480px)': { flexDirection: 'column', '> button': { marginLeft: 0 } },
  }),
}));

Dialog.Button = styled(Button)(({ theme }) => ({
  gridArea: 'footer',
  width: '100%',
  marginTop: 20,
  fontSize: 22,
  borderRadius: '0 0 4px 4px',
  ...(theme.modern && { width: 'calc(100% - 48px)', margin: '0 24px 24px', minHeight: 44, height: 'auto', padding: '10px 16px', fontSize: 14, fontWeight: 500, borderRadius: 10, whiteSpace: 'normal', '@media (max-width: 480px)': { width: 'calc(100% - 32px)', margin: '0 16px 16px' } }),
}));

export default Dialog;
