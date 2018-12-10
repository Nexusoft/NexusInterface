// External Dependencies
import React from 'react';
import styled from '@emotion/styled';
import { NavLink } from 'react-router-dom';

// Internal Global Dependencies
import Icon from 'components/common/Icon';
import { colors, timing } from 'styles';
import { fade, darken } from 'utils/colors';

const TabLi = styled.li({
  listStyle: 'none',
  flexGrow: 1,
  flexBasis: 0,
});

const TabLink = styled(NavLink)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.75em 1.5em',
  fontSize: '1.125em',
  color: darken(colors.light, 0.25),
  borderBottom: `1px solid ${darken(colors.light, 0.75)}`,
  transitionProperties: 'color, borderBottom',
  transitionDuration: timing.normal,

  '&:hover': {
    color: colors.light,
  },

  '&.active': {
    color: colors.primary,
    borderBottom: `1px solid ${colors.primary}`,
  },
});

const TabIcon = styled(Icon)({
  height: '1.25em',
  marginRight: '0.75em',
});

export const TabItem = ({ link, icon, text }) => (
  <TabLi>
    <TabLink to={link}>
      {!!icon && <TabIcon icon={icon} />}
      {text}
    </TabLink>
  </TabLi>
);

export const Tabs = styled.ul({
  display: 'flex',
  alignTtems: 'space-between',
  margin: '0 0 1em',
  padding: 0,
});

export default Tabs;
