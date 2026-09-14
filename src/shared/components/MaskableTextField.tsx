// External
import { useState } from 'react';

// Internal
import { TextField, TextFieldProps } from 'components/TextField';
import Icon from 'components/Icon';
import Button from 'components/Button';
import visibleIcon from 'icons/visible.svg';
import invisibleIcon from 'icons/invisible.svg';

export default function MaskableTextField(props: TextFieldProps) {
  const [unmasked, setUnmasked] = useState(false);

  const toggleUnmasked = () => {
    setUnmasked(!unmasked);
  };
  const maskableProps = {
    type: unmasked ? 'text' : 'password',
    right: (
      <Button skin="plain" onClick={toggleUnmasked} tabIndex={-1}>
        <Icon icon={unmasked ? visibleIcon : invisibleIcon} />
      </Button>
    ),
  };

  return <TextField {...props} {...maskableProps} />;
}
