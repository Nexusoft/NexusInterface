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
const TabToolTipText = styled.span({
  visibility: "hidden",
  width: "120px",
  backgroundColor: "#555",
  color: "#fff",
  textAlign: "center",
  padding: "5px 0",
  borderRadius: "6px",

  /* Position the tooltip text */
  position: "absolute",
  zIndex: "1",
  bottom: "125%",
  left: "50%",
  marginLeft: "-60px",

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

  '&.TabToolTip':
    {
      TabToolTipText
    },

  '&:hover': {
    color: theme.light,
    '&.TabToolTip':
    {
      TabToolTipText,
      visibility: 'visible',
    },
  },

  '&.active': {
    color: theme.primary,
    borderBottomColor: theme.primary,
  },
  
}));





const TabToolTip = styled.span({
  position: "relative",
  display: "inline-block",
  '&.TabToolTip':
    {
      TabToolTipText
    },
  '&:hover' :
  {
    TabToolTipText,
    visibility: 'visible',

  },

  
});
const Tab = ({ link, icon, text,toolTipText, isActive, }) => (
  
    <TabLi>
      <Tooltip.Trigger tooltip={toolTipText} position="top">
        <TabLink to={link} isActive={isActive}>
          {!!icon && <Icon spaceRight icon={icon} />}
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
