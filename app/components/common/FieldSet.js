// External Dependencies
import React from 'react';
import styled from '@emotion/styled';
import { colors } from 'styles';

const FieldSetWrapper = styled.fieldset({
  padding: '.5em 1.5em 1.5em',
  border: `1px solid ${colors.gray}`,
  borderRadius: 4,
});

const Legend = styled.legend({
  color: colors.lightGray,
});

const FieldSet = ({ legend, children, ...rest }) => (
  <FieldSetWrapper {...rest}>
    <Legend>{legend}</Legend>
    {children}
  </FieldSetWrapper>
);

export default FieldSet;
