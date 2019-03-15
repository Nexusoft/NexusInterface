// External Dependencies
import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';
import * as color from 'utils/color';

// Internal Global Dependencies
import Icon from 'components/Icon';
import ModuleIcon from 'components/ModuleIcon';

const intro = keyframes`
  from { 
    transform: scale(0.92);
    opacity: 0.66 
  }
  to { 
    transform: scale(1);
    opacity: 1
  }
`;

const borderRadius = 4;

const PanelComponent = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  color: theme.foreground,
  width: '100%',
  height: '100%',
  animation: `${intro} .2s ease-out`,
}));

const PanelHeader = styled.div(({ theme }) => ({
  background: theme.background,
  borderTopLeftRadius: borderRadius,
  borderTopRightRadius: borderRadius,
  flexShrink: 0,
  padding: '10px 30px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: theme.background,
}));

const PanelTitle = styled.h3(({ theme }) => ({
  fontSize: 28,
  fontWeight: 'normal',
  margin: 0,
  color: theme.primary,
}));

const PanelBody = styled.div(
  ({ theme }) => ({
    background: color.darken(theme.background, 0.3),
    borderBottomLeftRadius: borderRadius,
    borderBottomRightRadius: borderRadius,
    flexGrow: 1,
    padding: '20px 30px',
    position: 'relative',
  }),
  ({ scrollable }) => ({
    overflow: scrollable ? 'auto' : 'hidden',
  })
);

const PanelBodyOverlay = styled.div({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  padding: '20px 30px',
});

const IconImg = styled.img({
  width: '1em',
  height: '1em',
  verticalAlign: 'middle',
});

const Panel = ({ icon, title, controls, children, bodyScrollable = true }) => (
  <PanelComponent>
    <PanelHeader>
      <PanelTitle>
        {!!icon && <Icon className="space-right" icon={icon} />}
        <span className="v-align">{title}</span>
      </PanelTitle>
      {controls}
    </PanelHeader>

    <PanelBody scrollable={bodyScrollable}>
      {bodyScrollable ? (
        children
      ) : (
        <PanelBodyOverlay>{children}</PanelBodyOverlay>
      )}
    </PanelBody>
  </PanelComponent>
);

export default Panel;
