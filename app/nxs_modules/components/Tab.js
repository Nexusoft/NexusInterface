// External Dependencies
import React from 'react';
import styled from '@emotion/styled';
import { NavLink } from 'react-router-dom';
import Tooltip from 'components/Tooltip';

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
  padding: '0 1.5em 0.75em',
  fontSize: '1.125em',
  color: theme.mixer(0.75),
  borderBottom: `1px solid ${theme.mixer(0.25)}`,
  transitionProperties: 'color, borderBottom',
  transitionDuration: timing.normal,

  '&:hover': {
    color: theme.foreground,
  },

  '&.active': {
    color: theme.primary,
    borderBottomColor: theme.primary,
  },
}));

const Tab = ({ link, icon, text, toolTipText, isActive }) => (
  <TabLi>
    <Tooltip.Trigger tooltip={toolTipText} position="top">
      <TabLink to={link} isActive={isActive}>
        {!!icon && <Icon className="space-right" icon={icon} />}
        {text}
      </TabLink>
    </Tooltip.Trigger>
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
