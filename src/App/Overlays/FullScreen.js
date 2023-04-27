import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

import { timing } from 'styles';

const intro = keyframes`
  from { 
    transform: scale(1.2);
    opacity: 0 
  }
  to { 
    transform: scale(1);
    opacity: 1
  }
`;

const FullScreenComponent = styled.div(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  padding: '10px 30px',
  background: theme.lower(theme.background, 0.2),
  color: theme.mixer(0.75),
  animation: `${intro} ${timing.quick} ease-out`,
  display: 'grid',
  gridTemplateAreas: '"header" "body" "footer"',
  gridTemplateColumns: '1fr',
  gridTemplateRows: 'min-content auto min-content',
}));

const ContainerComponent = styled.div(({ width }) => ({
  width,
  marginLeft: 'auto',
  marginRight: 'auto',
}));

const Container = ({ width = 768, children }) =>
  width ? (
    <ContainerComponent width={width}>{children}</ContainerComponent>
  ) : (
    children
  );

const FullScreenHeader = styled.h2(({ theme }) => ({
  gridArea: 'header',
  color: theme.primary,
  fontSize: 24,
  fontWeight: 'normal',
  textAlign: 'center',
}));

const InnerHeader = styled.div(({ theme }) => ({
  padding: '20px 0',
  borderBottom: `2px solid ${theme.primary}`,
}));

const FullScreenBody = styled.div({
  gridArea: 'body',
  padding: '20px 0',
  overflowY: 'auto',
});

const FullScreenFooter = styled.div({
  gridArea: 'footer',
});

export default function FullScreen({
  children,
  header,
  footer,
  width,
  ...rest
}) {
  return (
    <FullScreenComponent {...rest}>
      {!!header && (
        <FullScreenHeader>
          <Container width={width}>
            <InnerHeader>{header}</InnerHeader>
          </Container>
        </FullScreenHeader>
      )}
      <FullScreenBody>
        <Container width={width}>{children}</Container>
      </FullScreenBody>
      {!!footer && (
        <FullScreenFooter>
          <Container width={width}>{footer}</Container>
        </FullScreenFooter>
      )}
    </FullScreenComponent>
  );
}
