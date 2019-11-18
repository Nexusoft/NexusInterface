// External
import React, { Component } from 'react';

// Internal
import TextField from 'components/TextField';
import Icon from 'components/Icon';
import Button from 'components/Button';
import visibleIcon from 'icons/visible.svg';
import invisibleIcon from 'icons/invisible.svg';

export default class MaskableTextField extends Component {
  state = {
    unmasked: false,
  };

  toggleUnmasked = () => {
    this.setState({ unmasked: !this.state.unmasked });
  };

  render() {
    const { unmasked } = this.state;

    return (
      <TextField
        {...this.props}
        type={unmasked ? 'text' : 'password'}
        right={
          <Button skin="plain" onClick={this.toggleUnmasked} tabIndex="-1">
            <Icon icon={unmasked ? invisibleIcon : visibleIcon} />
          </Button>
        }
      />
    );
  }
}

// MaskableTextField wrapper for redux-form
const MaskableTextFieldReduxForm = ({ input, meta, ...rest }) => (
  <MaskableTextField error={meta.touched && meta.error} {...input} {...rest} />
);
MaskableTextField.RF = MaskableTextFieldReduxForm;
