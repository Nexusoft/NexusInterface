// External Dependencies
import React from 'react';
import styled from '@emotion/styled';
import { NavLink } from 'react-router-dom';

// Internal Global Dependencies
import Icon from 'components/Icon';
import { timing } from 'styles';

const TabLi = styled.li({
  listStyle: 'none',
  flexGrow: 1,
  flexBasis: 0,
});

const TabLink = styled(NavLink)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.75em 1.5em',
  fontSize: '1.125em',
  color: theme.lightGray,
  borderBottom: `1px solid ${theme.darkGray}`,
  transitionProperties: 'color, borderBottom',
  transitionDuration: timing.normal,

  '&:hover': {
    color: theme.light,
  },

  '&.active': {
    color: theme.primary,
    borderBottomColor: theme.primary,
  },
}));

const Tab = ({ link, icon, text, isActive }) => (
  <TabLi>
    <TabLink to={link} isActive={isActive}>
      {!!icon && <Icon spaceRight icon={icon} />}
      {text}
    </TabLink>
  </TabLi>
);

const TabBar = styled.ul({
  display: 'flex',
  justifyContent: 'space-between',
  margin: '0 0 1em',
  padding: 0,
});

Tab.Bar = TabBar;

export default Tab;
