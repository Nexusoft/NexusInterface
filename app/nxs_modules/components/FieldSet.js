// External Dependencies
import React from 'react';
import styled from '@emotion/styled';

const FieldSetComponent = styled.fieldset(({ theme }) => ({
  padding: '.5em 1.5em 1.5em',
  borderRadius: 4,
  border: `1px solid ${theme.mixer(0.25)}`,
}));

const Legend = styled.legend(({ theme }) => ({
  textTransform: 'uppercase',
  textAlign: 'center',
  padding: '0 .5em',
  color: theme.mixer(0.75),
}));

class FieldSet extends React.Component {
  render() {
    const { legend, children, ...rest } = this.props;
    return (
      <FieldSetComponent {...rest}>
        <Legend>{legend}</Legend>
        {children}
      </FieldSetComponent>
    );
  }
}

export default FieldSet;
