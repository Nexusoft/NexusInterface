// External
import React, { Component } from 'react';
import styled from '@emotion/styled';

// Internal
import { newUID } from 'utils';

const FieldWrapper = styled.div({
  display: 'flex',
  alignItems: 'center',
  padding: '0.8em 0',
});

const Label = styled.label({
  width: 300,
  position: 'relative',
});

class SettingsField extends Component {
  inputId = newUID();

  render() {
    const { label, tooltip, connectLabel, children, ...rest } = this.props;
    return (
      <FieldWrapper {...rest}>
        <Label htmlFor={connectLabel ? this.inputId : undefined}>
          {label}
          {tooltip && (
            <div className="tooltip bottom" style={{ width: 226 }}>
              {tooltip}
            </div>
          )}
        </Label>
        {connectLabel
          ? React.cloneElement(React.Children.only(children), {
              id: this.inputId,
            })
          : children}
      </FieldWrapper>
    );
  }
}

export default SettingsField;
