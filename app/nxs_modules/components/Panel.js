// External Dependencies
import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';
import * as color from 'utils/color';

// Internal Global Dependencies
import Icon from 'components/Icon';

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
  display: 'grid',
  gridTemplateAreas: '"header" "body"',
  gridTemplateRows: 'min-content 1fr',
  color: theme.foreground,
  width: '100%',
  height: '100%',
  animation: `${intro} .2s ease-out`,
}));

const PanelHeader = styled.div(({ theme }) => ({
  gridArea: 'header',
  background: theme.background,
  borderTopLeftRadius: borderRadius,
  borderTopRightRadius: borderRadius,
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

const PanelBody = styled.div(({ theme }) => ({
  gridArea: 'body',
  background: color.darken(theme.background, 0.3),
  borderBottomLeftRadius: borderRadius,
  borderBottomRightRadius: borderRadius,
  padding: '20px 30px',
  position: 'relative',
  overflow: 'auto',
}));

const Panel = ({ icon, title, controls, children }) => (
  <PanelComponent>
    <PanelHeader>
      <PanelTitle>
        {!!icon && <Icon className="space-right" icon={icon} />}
        <span className="v-align">{title}</span>
      </PanelTitle>
      {controls}
    </PanelHeader>

    <PanelBody>{children}</PanelBody>
  </PanelComponent>
);

export default Panel;
