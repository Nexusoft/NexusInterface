import styled from '@emotion/styled';
import { Link as RouterLink } from 'react-router-dom';
import { timing } from 'styles';

const Link = styled(RouterLink)(({ theme }) => ({
  '&, &:active': {
    display: 'inline',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    color: theme.lightGray,
    transition: `color ${timing.normal}`,
  },
  '&:hover': {
    color: theme.light,
  },
}));

export default Link;
