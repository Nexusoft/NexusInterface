import { useState, useEffect, useRef } from 'react';
import { ipcRenderer } from 'electron';
import Keyboard from 'react-simple-keyboard';
import styled from '@emotion/styled';

import GlobalStyles from 'components/GlobalStyles';
import ThemeController from 'components/ThemeController';
import TextField from 'components/TextField';
import MaskableTextField from 'components/MaskableTextField';

import KeyboardStyles from './KeyboardStyles';

const KeyboardWrapper = styled.div({
  padding: 5,
});

const InputWrapper = styled.div({
  padding: 5,
  columnGap: 5,
  alignItems: 'stretch',
});

export default function App() {
  const [options, setOptions] = useState(null);
  const [text, setText] = useState('');
  const [capslock, setCapslock] = useState(false);
  const [shift, setShift] = useState(false);
  const populatedRef = useRef(false);

  useEffect(() => {
    ipcRenderer.once('options', (evt, options) => {
      setOptions(options);
      setText(options.defaultText);
    });
  }, []);

  const handleChange = (text) => {
    setText(text);
    ipcRenderer.send('keyboard-input-change', text);
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
  };

  const handleKeyPress = (btn) => {
    switch (btn) {
      case '{shift}':
        setShift(!shift);
        break;
      case '{lock}':
        setCapslock(!capslock);
        break;
      case '{enter}':
        ipcRenderer.send('close-keyboard');
        break;
      default:
        if (shift) {
          setShift(false);
        }
    }
  };

  if (!options) return null;

  const { theme, maskable, placeholder } = options;
  const Input = maskable ? MaskableTextField : TextField;

  return (
    <ThemeController theme={theme}>
      <KeyboardWrapper>
        <GlobalStyles />
        <KeyboardStyles />

        <InputWrapper>
          <Input
            readOnly
            value={text}
            onChange={handleInputChange}
            placeholder={placeholder}
            skin="filled-inverted"
            style={{ borderRadius: 5, fontSize: 18 }}
          />
        </InputWrapper>

        <Keyboard
          keyboardRef={(keyboard) => {
            if (!populatedRef.current && options) {
              keyboard.setInput(options.defaultText);
              populatedRef.current = true;
            }
          }}
          layout={{
            default: [
              '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
              '{tab} q w e r t y u i o p [ ] \\',
              "{lock} a s d f g h j k l ; ' {enter}",
              '{shift} z x c v b n m , . / {shift}',
              '{space}',
            ],
            shift: [
              '~ ! @ # $ % ^ & * ( ) _ + {bksp}',
              '{tab} Q W E R T Y U I O P { } |',
              '{lock} A S D F G H J K L : " {enter}',
              '{shift} Z X C V B N M < > ? {shift}',
              '{space}',
            ],
          }}
          layoutName={
            (capslock && !shift) || (!capslock && shift) ? 'shift' : 'default'
          }
          display={{
            '{enter}': 'done',
          }}
          mergeDisplay
          buttonTheme={[
            {
              class: 'btn-submit',
              buttons: '{enter}',
            },
          ]}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          tabCharOnTab={false}
        />
      </KeyboardWrapper>
    </ThemeController>
  );
}
