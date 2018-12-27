// External Dependencies
import React from 'react';
import styled from '@emotion/styled';
import { colors } from 'styles';

const FieldSetComponent = styled.fieldset({
  padding: '.5em 1.5em 1.5em',
  border: `1px solid ${colors.darkgray}`,
  borderRadius: 4,
});

const Legend = styled.legend({
  color: colors.lightGray,
  textTransform: 'uppercase',
  textAlign: 'center',
  padding: '0 .5em',
});

const FieldSet = ({ legend, children, ...rest }) => (
  <FieldSetComponent {...rest}>
    <Legend>{legend}</Legend>
    {children}
  </FieldSetComponent>
);

export default FieldSet;
