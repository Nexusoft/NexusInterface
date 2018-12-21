// External
import React, { Component } from 'react';
import styled from '@emotion/styled';

// Internal
import { newUID } from 'utils';

const Label = styled.label({
  display: 'block',
  position: 'relative',
  marginTop: '.5em',
  marginBottom: '.2em',
});

class FormField extends Component {
  inputId = newUID();

  render() {
    const {
      label,
      tooltip,
      connectLabel,
      inputWrapped,
      children,
      ...rest
    } = this.props;

    return (
      <div {...rest}>
        <Label htmlFor={connectLabel ? this.inputId : undefined}>
          {label}
          {tooltip && (
            <div className="tooltip left" style={{ width: 226 }}>
              {tooltip}
            </div>
          )}
        </Label>
        <div>
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
        </div>
      </div>
    );
  }
}

export default FormField;
