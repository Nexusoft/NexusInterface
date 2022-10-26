// External
import styled from '@emotion/styled';

export default styled.span(({ theme, label }) => ({
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  marginTop: '2em',

  '&::before': {
    content: '""',
    borderBottom: `1px solid ${theme.mixer(0.5)}`,
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
  },

  '&::after': {
    content: `"${label}"`,
    position: 'relative',
    display: 'block',
    padding: '0 1em',
    background: theme.lower(theme.background, 0.3),
  },
}));
