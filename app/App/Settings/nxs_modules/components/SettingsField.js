// External
import React, { Component } from 'react';
import styled from '@emotion/styled';

// Internal
import { newUID } from 'utils';
import { colors } from 'styles';

const Field = styled.div(
  {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1em 0',
    borderBottom: `1px solid ${colors.darkerGray}`,
  },
  ({ center }) =>
    center && {
      alignItems: 'center',
    }
);

const Label = styled.label({
  position: 'relative',
  paddingRight: '3em',
  width: 400,
});

const SubLabel = styled.div({
  color: colors.lightGray,
  fontSize: '.9em',
});

const Input = styled.div({
  flexGrow: 1,
});

class SettingsField extends Component {
  inputId = newUID();

  settingsInput = () => {
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
    const { label, subLabel, connectLabel, children, ...rest } = this.props;
    return (
      <Field center={!subLabel} {...rest}>
        <Label htmlFor={connectLabel ? this.inputId : undefined}>
          <div>{label}</div>
          {subLabel && <SubLabel>{subLabel}</SubLabel>}
        </Label>
        <Input>{this.settingsInput()}</Input>
      </Field>
    );
  }
}

export default SettingsField;
