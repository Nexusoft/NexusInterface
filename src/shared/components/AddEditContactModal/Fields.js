import styled from '@emotion/styled';
import Form from 'components/Form';
import { mix } from 'utils/color';

const fieldStyles = ({ theme }) => theme.modern && ({
  borderRadius: 10, minHeight: 44, fontSize: 13,
  background: mix(theme.background, '#000000', 0.16),
  color: theme.foreground,
  'input, textarea': { fontSize: 13, minWidth: 0 },
  'input::placeholder, textarea::placeholder': { color: theme.mixer(0.5), opacity: 1 },
});

export const ContactInput = styled(Form.TextField)(fieldStyles);
export const ContactSelect = styled(Form.Select)(fieldStyles, ({ theme }) => theme.modern && ({
  // The field already shows focus through its surrounding border and glow.
  '&& > button:focus-visible': { outline: 'none' },
}));
