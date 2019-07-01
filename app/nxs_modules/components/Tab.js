/**
 * Important note - This file is imported into module_preload.js, either directly or
 * indirectly, and will be a part of the preload script for modules, therefore:
 * - Be picky with importing stuffs into this file, especially for big
 * files and libraries. The bigger the preload scripts get, the slower the modules
 * will load.
 * - Don't assign anything to `global` variable because it will be passed
 * into modules' execution environment.
 * - Make sure this note also presents in other files which are imported here.
 */

// External Dependencies
import React from 'react';
import styled from '@emotion/styled';
import { NavLink } from 'react-router-dom';

// Internal Global Dependencies
import Tooltip from 'components/Tooltip';
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

const Tab = React.forwardRef(
  ({ link, icon, text, toolTipText, isActive, ...rest }, ref) => (
    <TabLi {...rest} ref={ref}>
      <Tooltip.Trigger tooltip={toolTipText} position="top">
        <TabLink to={link} isActive={isActive}>
          {!!icon && <Icon className="space-right" icon={icon} />}
          {text}
        </TabLink>
      </Tooltip.Trigger>
    </TabLi>
  )
);

const TabBar = styled.ul({
  display: 'flex',
  justifyContent: 'space-between',
  margin: '0 0 1em',
  padding: 0,
});

Tab.Bar = TabBar;

export default Tab;
