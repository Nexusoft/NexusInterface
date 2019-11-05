import React from 'react';
import styled from '@emotion/styled';

const Row = styled.div(({ leftSize, rightSize }) => ({
  display: 'grid',
  gridTemplateAreas: '"label value"',
  gridTemplateColumns: `${leftSize}fr ${rightSize}fr`,
  alignItems: 'start',
  columnGap: '1em',
  marginBottom: '.6em',
}));

const Label = styled.div(({ theme }) => ({
  gridArea: 'label',
  textAlign: 'right',
  color: theme.mixer(0.875),
}));

const Value = styled.div({
  gridArea: 'value',
  wordBreak: 'break-word',
});

const InfoField = ({
  leftSize = 1,
  rightSize = 3,
  label,
  children,
  ...rest
}) => (
  <Row leftSize={leftSize} rightSize={rightSize} {...rest}>
    <Label>{label}</Label>
    <Value>{children}</Value>
  </Row>
);

export default InfoField;
