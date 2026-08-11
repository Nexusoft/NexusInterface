import { useState, useEffect, useRef } from 'react';
import Keyboard from 'react-simple-keyboard';
import styled from '@emotion/styled';

import GlobalStyles from 'components/GlobalStyles';
import ThemeController, { FortifiedTheme } from 'components/ThemeController';
import { TextField } from 'components/TextField';
import MaskableTextField from 'components/MaskableTextField';

import KeyboardStyles from './KeyboardStyles';

interface Options {
  theme: FortifiedTheme;
  defaultText: string;
  maskable: boolean;
  placeholder: string;
}

declare global {
  interface Window {
    virtualKeyboard: {
      onOptions(listener: (options: Options) => void): void;
      inputChanged(text: string): void;
      close(): void;
    };
  }
}

const KeyboardWrapper = styled.div({
  padding: 5,
});

const InputWrapper = styled.div({
  padding: 5,
  columnGap: 5,
  alignItems: 'stretch',
});

export default function App() {
  const [options, setOptions] = useState<Options | null>(null);
  const [text, setText] = useState('');
  const [capslock, setCapslock] = useState(false);
  const [shift, setShift] = useState(false);
  const populatedRef = useRef(false);

  useEffect(() => {
    window.virtualKeyboard.onOptions((options: Options) => {
      setOptions(options);
      setText(options.defaultText);
    });
  }, []);

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
            onChange={(e) => {
              setText(e.target.value);
            }}
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
          onChange={(text) => {
            setText(text);
            window.virtualKeyboard.inputChanged(text);
          }}
          onKeyPress={(btn) => {
            switch (btn) {
              case '{shift}':
                setShift(!shift);
                break;
              case '{lock}':
                setCapslock(!capslock);
                break;
              case '{enter}':
                window.virtualKeyboard.close();
                break;
              default:
                if (shift) {
                  setShift(false);
                }
            }
          }}
          tabCharOnTab={false}
        />
      </KeyboardWrapper>
    </ThemeController>
  );
}
