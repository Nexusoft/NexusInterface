// External
import { useState, forwardRef } from 'react';

// Internal
import TextField, { TextFieldProps } from 'components/TextField';
import Icon from 'components/Icon';
import Button from 'components/Button';
import visibleIcon from 'icons/visible.svg';
import invisibleIcon from 'icons/invisible.svg';

const MaskableTextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function (props, ref) {
    const [unmasked, setUnmasked] = useState(false);

    const toggleUnmasked = () => {
      setUnmasked(!unmasked);
    };

    return (
      <TextField
        {...props}
        type={unmasked ? 'text' : 'password'}
        ref={ref}
        right={
          <Button skin="plain" onClick={toggleUnmasked} tabIndex={-1}>
            <Icon icon={unmasked ? visibleIcon : invisibleIcon} />
          </Button>
        }
      />
    );
  }
);

export default MaskableTextField;
