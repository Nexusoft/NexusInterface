// External Dependencies
import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

// Internal Global Dependencies
import Icon from 'components/common/Icon';
import { colors } from 'styles';

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

const PanelWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  color: lightColor,
  width: '100%',
  animation: `${intro} .2s ease-out`,
});

const PanelHeader = styled.div({
  backgroundColor: colors.dark,
  borderTopLeftRadius: borderRadius,
  borderTopRightRadius: borderRadius,
  flexShrink: 0,
  padding: '10px 30px',
  fontSize: 28,
  fontWeight: 200,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const PanelBody = styled.div({
  backgroundColor: colors.dark,
  borderBottomLeftRadius: borderRadius,
  borderBottomRightRadius: borderRadius,
  opacity: 0.7,
  flexGrow: 1,
  padding: '10px 20px',
  overflowY: 'overlay',
});

const Panel = ({ icon, title, controls, children }) => (
  <PanelWrapper>
    <PanelHeader>
      <div>
        {!!icon && (
          <>
            <Icon icon={icon} width={28} height={28} />' '
          </>
        )}
        <span className={vAlign}>{title}</span>
      </div>
      {controls}
    </PanelHeader>

    <PanelBody>{children}</PanelBody>
  </PanelWrapper>
);

export default Panel;
