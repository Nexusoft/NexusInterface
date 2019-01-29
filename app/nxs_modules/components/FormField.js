// External
import React, { Component } from 'react';
import styled from '@emotion/styled';

// Internal
import { newUID } from 'utils';

const FormFieldComponent = styled.div(
  { marginTop: '1em' },
  ({ inline }) =>
    inline && {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '',
    }
);

const Label = styled.label(
  {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    marginBottom: '.2em',
  },
  ({ capitalize }) =>
    capitalize && {
      textTransform: 'uppercase',
      fontSize: '.8em',
    }
);

const Hint = styled.div(({ theme }) => ({
  position: 'absolute',
  visibility: 'hidden',
  opacity: 0,
  background: '#444',
  color: '#fff',
  padding: '0.25em 0.5em',
  textAlign: 'center',
  transition: 'all 0.25s linear',
  top: 'calc(100% + 0.8em)',
  zIndex: 1,

  '&::before': {
    content: '""',
    position: 'absolute',
    width: 0,
    height: 0,
    borderWidth: '0.5em',
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderBottomColor: '#444',
    transition: 'all 0.25s linear',
    bottom: '100%',
    left: '1em',
  },

  'input:invalid:focus + &': {
    visibility: 'visible',
    opacity: 1,
    color: '#fff',
    background: theme.danger,
  },

  'input:invalid:focus + &::before': {
    borderBottomColor: theme.danger,
  },
}));

class FormField extends Component {
  inputId = newUID();

  formInput = () => {
    const { connectLabel, children } = this.props;
    if (connectLabel) {
      if (typeof children === 'function') {
        return children(this.inputId);
      } else {
        return React.cloneElement(React.Children.only(children), {
          id: this.inputId,
        });
      }
    }

    return children;
  };

  render() {
    const {
      label,
      capitalizeLabel = true,
      connectLabel,
      children,
      hint,
      ...rest
    } = this.props;

    return (
      <FormFieldComponent {...rest}>
        <Label
          capitalize={capitalizeLabel}
          htmlFor={connectLabel ? this.inputId : undefined}
        >
          {label}
        </Label>
        <div className="relative">
          {this.formInput()}
          {!!hint && <Hint>{hint}</Hint>}
        </div>
      </FormFieldComponent>
    );
  }
}

export default FormField;
