// External
import React, { Component } from 'react';
import styled from '@emotion/styled';

// Internal
import { newUID } from 'utils';

const FormFieldWrapper = styled.div(
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
    display: 'block',
    position: 'relative',
    marginBottom: '.2em',
  },
  ({ capitalize }) =>
    capitalize && {
      textTransform: 'uppercase',
      fontSize: '.8em',
    }
);

const Hint = styled.div({
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
    background: 'red',
  },

  'input:invalid:focus + &::before': {
    borderBottomColor: 'red',
  },
});

class FormField extends Component {
  inputId = newUID();

  render() {
    const {
      label,
      capitalizeLabel = true,
      tooltip,
      connectLabel,
      inputWrapped,
      children,
      hint,
      ...rest
    } = this.props;

    return (
      <FormFieldWrapper {...rest}>
        <Label
          capitalize={capitalizeLabel}
          htmlFor={connectLabel ? this.inputId : undefined}
        >
          {label}
          {tooltip && (
            <div className="tooltip left" style={{ width: 226 }}>
              {tooltip}
            </div>
          )}
        </Label>
        <div className="relative">
          {connectLabel
            ? React.cloneElement(
                React.Children.only(children),
                inputWrapped
                  ? {
                      inputProps: {
                        id: this.inputId,
                        ...children.props.inputProps,
                      },
                    }
                  : { id: this.inputId }
              )
            : children}
          {!!hint && <Hint>{hint}</Hint>}
        </div>
      </FormFieldWrapper>
    );
  }
}

export default FormField;
