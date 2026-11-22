import styled from '@emotion/styled';
import { fade } from 'utils/color';
import themeStyles from 'utils/themeStyles';

const StatusIcon = styled.div(themeStyles([{
  marginLeft: 20
}], [({
  theme
}) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 34,
  height: 34,
  padding: '0 8px',
  border: '1px solid transparent',
  borderRadius: 8,
  background: 'transparent',
  color: theme.primary,
  fontSize: 17,
  lineHeight: 1,
  transition: 'background 160ms ease, border-color 160ms ease, color 160ms ease',
  '&:hover, &:focus-visible': {
    background: fade(theme.primary, 0.9),
    borderColor: fade(theme.primary, 0.65),
    color: theme.foreground
  },
  '&[data-active="true"]::after': {
    content: '""',
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: theme.primary,
    boxShadow: `0 0 7px ${theme.primary}`
  }
})]));

export default StatusIcon;
