// External
import { useEffect, useCallback, forwardRef } from 'react';
import { ipcRenderer } from 'electron';

// Internal
import TextField, { TextFieldProps } from 'components/TextField';
import MaskableTextField from 'components/MaskableTextField';
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import Button from 'components/Button';
import { themeAtom } from 'lib/theme';
import { store } from 'lib/store';
import keyboardIcon from 'icons/keyboard.svg';

export interface TextFieldWithKeyboardProps extends TextFieldProps {
  maskable?: boolean;
}

const TextFieldWithKeyboard = forwardRef<
  HTMLInputElement,
  TextFieldWithKeyboardProps
>(function ({ value, onChange, placeholder, maskable, skin, ...rest }, ref) {
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

  const Component = maskable ? MaskableTextField : TextField;

  return (
    <Component
      {...{ value, onChange, placeholder, skin }}
      skin={skin}
      onChange={onChange}
      ref={ref}
      {...rest}
      left={
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
      }
    />
  );
});

export default TextFieldWithKeyboard;
