// External
import { useState } from 'react';

// Internal
import TextField from 'components/TextField';
import Icon from 'components/Icon';
import Button from 'components/Button';
import visibleIcon from 'icons/visible.svg';
import invisibleIcon from 'icons/invisible.svg';

export default function MaskableTextField(props) {
  const [unmasked, setUnmasked] = useState(false);

  const toggleUnmasked = () => {
    setUnmasked(!unmasked);
  };

  return (
    <TextField
      {...props}
      type={unmasked ? 'text' : 'password'}
      right={
        <Button skin="plain" onClick={toggleUnmasked} tabIndex="-1">
          <Icon icon={unmasked ? visibleIcon : invisibleIcon} />
        </Button>
      }
    />
  );
}

// MaskableTextField wrapper for redux-form
const MaskableTextFieldReduxForm = ({ input, meta, ...rest }) => (
  <MaskableTextField error={meta.touched && meta.error} {...input} {...rest} />
);
MaskableTextField.RF = MaskableTextFieldReduxForm;
