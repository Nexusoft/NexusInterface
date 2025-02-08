// External
import { ReactNode, useState } from 'react';

// Internal
import TextField, {
  MultilineTextFieldProps,
  SinglelineTextFieldProps,
  TextFieldProps,
} from 'components/TextField';
import Icon from 'components/Icon';
import Button from 'components/Button';
import visibleIcon from 'icons/visible.svg';
import invisibleIcon from 'icons/invisible.svg';

export default function MaskableTextField(
  props: SinglelineTextFieldProps
): ReactNode;
export default function MaskableTextField(
  props: MultilineTextFieldProps
): ReactNode;
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

  // Need this discrimination type guard to narrow the props type down to
  // either SinglelineTextFieldProps or MultilineTextFieldProps
  if (props.multiline === true) {
    return <TextField {...props} {...maskableProps} />;
  } else {
    return <TextField {...props} {...maskableProps} />;
  }
}
