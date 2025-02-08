// External
import { useEffect, useCallback, ReactNode } from 'react';
import { ipcRenderer } from 'electron';

// Internal
import TextField, {
  TextFieldProps,
  SinglelineTextFieldProps,
  MultilineTextFieldProps,
} from 'components/TextField';
import MaskableTextField from 'components/MaskableTextField';
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import Button from 'components/Button';
import { themeAtom } from 'lib/theme';
import { store } from 'lib/store';
import keyboardIcon from 'icons/keyboard.svg';

export interface UniqueTextFieldWithKeyboardProps {
  maskable?: boolean;
}

export interface SinglelineTextFieldWithKeyboardProps
  extends SinglelineTextFieldProps,
    UniqueTextFieldWithKeyboardProps {}

export interface MultilineTextFieldWithKeyboardProps
  extends MultilineTextFieldProps,
    UniqueTextFieldWithKeyboardProps {}

export type TextFieldWithKeyboardProps = TextFieldProps & {
  maskable?: boolean;
};

export default function TextFieldWithKeyboard(
  props: SinglelineTextFieldWithKeyboardProps
): ReactNode;
export default function TextFieldWithKeyboard(
  props: MultilineTextFieldWithKeyboardProps
): ReactNode;
export default function TextFieldWithKeyboard(
  props:
    | SinglelineTextFieldWithKeyboardProps
    | MultilineTextFieldWithKeyboardProps
) {
  const { maskable, ...textFieldProps } = props;
  const { value, onChange, placeholder, skin, multiline } = textFieldProps;
  const handleInputChange = useCallback((_evt: any, text: any) => {
    onChange?.(text);
  }, []);

  const openKeyboard = () => {
    ipcRenderer.on('keyboard-input-change', handleInputChange);
    ipcRenderer.once('keyboard-closed', () => {
      ipcRenderer.off('keyboard-input-change', handleInputChange);
    });
    ipcRenderer.invoke('open-virtual-keyboard', {
      theme: store.get(themeAtom),
      defaultText: value,
      maskable: maskable,
      placeholder: placeholder,
    });
  };

  useEffect(
    () => () => {
      ipcRenderer.off('keyboard-input-change', handleInputChange);
    },
    []
  );
  const left = (
    <Tooltip.Trigger align="start" tooltip={__('Use virtual keyboard')}>
      <Button
        skin="plain"
        onClick={openKeyboard}
        tabIndex={-1}
        style={
          skin === 'filled' || skin === 'filled-inverted'
            ? { paddingRight: 0 }
            : { paddingLeft: 0 }
        }
      >
        <Icon icon={keyboardIcon} />
      </Button>
    </Tooltip.Trigger>
  );

  // Need this discrimination type guard to narrow the textFieldProps type down to
  // either SinglelineTextFieldProps or MultilineTextFieldProps
  if (multiline === true) {
    if (maskable) {
      return <MaskableTextField left={left} {...textFieldProps} />;
    }
    return <TextField left={left} {...textFieldProps} />;
  } else {
    if (maskable) {
      return <MaskableTextField left={left} {...textFieldProps} />;
    }
    return <TextField left={left} {...textFieldProps} />;
  }
}
