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
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { ComponentProps, ReactNode } from 'react';

// Internal Global Dependencies
import Icon, { SvgIcon } from 'components/Icon';

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
  width: '100%',
  height: '100%',
  padding: '30px 10%',
  display: 'flex',
  alignItems: 'stretch',
});

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
  color: theme.mixer(0.75),
}));

const PanelTitle = styled.h3(({ theme }) => ({
  fontSize: 28,
  fontWeight: 'normal',
  margin: 0,
  color: theme.primary,
}));

const PanelBody = styled.div(({ theme }) => ({
  gridArea: 'body',
  background: theme.lower(theme.background, 0.3),
  borderBottomLeftRadius: borderRadius,
  borderBottomRightRadius: borderRadius,
  padding: '20px 30px',
  position: 'relative',
  overflow: 'auto',
  overscrollBehavior: 'none',
}));

export interface PanelProps
  extends Omit<ComponentProps<typeof PanelWrapper>, 'title'> {
  icon?: SvgIcon;
  title?: ReactNode;
  controls?: ReactNode;
}

const Panel = ({
  icon,
  title,
  controls,
  ref,
  children,
  ...rest
}: PanelProps) => (
  <PanelWrapper {...rest}>
    <PanelComponent ref={ref}>
      <PanelHeader>
        <PanelTitle>
          {!!icon && <Icon className="mr0_4" icon={icon} />}
          <span className="v-align">{title}</span>
        </PanelTitle>
        {controls}
      </PanelHeader>

      <PanelBody>{children}</PanelBody>
    </PanelComponent>
  </PanelWrapper>
);

export default Panel;
