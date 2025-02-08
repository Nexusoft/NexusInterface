// External
import { useEffect, useCallback } from 'react';
import { ipcRenderer } from 'electron';

// Internal
import {
  TextField,
  TextFieldProps,
  MultilineTextField,
  MultilineTextFieldProps,
} from 'components/TextField';
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import Button from 'components/Button';
import { themeAtom } from 'lib/theme';
import { store } from 'lib/store';
import keyboardIcon from 'icons/keyboard.svg';

export interface TextFieldWithKeyboardProps extends TextFieldProps {
  maskable?: boolean;
}

export interface MultilineTextFieldWithKeyboardProps
  extends MultilineTextFieldProps {
  maskable?: false;
}

function useTextFieldProps(props: TextFieldWithKeyboardProps): TextFieldProps;
function useTextFieldProps(
  props: MultilineTextFieldWithKeyboardProps
): MultilineTextFieldProps;
function useTextFieldProps(
  props: TextFieldWithKeyboardProps | MultilineTextFieldWithKeyboardProps
) {
  const { maskable, ...textFieldProps } = props;
  const { value, onChange, placeholder, skin } = textFieldProps;
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

  return {
    left,
    ...textFieldProps,
  } as TextFieldProps | MultilineTextFieldProps;
}

export function TextFieldWithKeyboard(props: TextFieldWithKeyboardProps) {
  const textFieldProps = useTextFieldProps(props);
  return <TextField {...textFieldProps} />;
}

export function MultilineTextFieldWithKeyboard(
  props: MultilineTextFieldWithKeyboardProps
) {
  const textFieldProps = useTextFieldProps(props);
  return <MultilineTextField {...textFieldProps} />;
}
