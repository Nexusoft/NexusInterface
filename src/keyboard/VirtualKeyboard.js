import React from 'react';
import { ipcRenderer } from 'electron';
import { ThemeProvider } from 'emotion-theming';
import Keyboard from 'react-simple-keyboard';
import styled from '@emotion/styled';

import GlobalStyles from 'components/GlobalStyles';
import TextField from 'components/TextField';
import MaskableTextField from 'components/MaskableTextField';
import { getMixer } from 'utils/color';

import KeyboardStyles from './KeyboardStyles';

const KeyboardWrapper = styled.div({
  padding: 5,
});

const InputWrapper = styled.div({
  padding: 5,
  columnGap: 5,
  alignItems: 'stretch',
});

export default class App extends React.Component {
  state = {
    options: null,
    text: '',
    capitalized: false,
  };

  populated = false;

  constructor(props) {
    super(props);
    ipcRenderer.once('options', (evt, options) => {
      this.setState({ options, text: options.defaultText });
    });
  }

  handleChange = text => {
    this.setState({ text });
    ipcRenderer.send('keyboard-input-change', text);
  };

  handleInputChange = e => {
    this.setState({ text: e.target.value });
  };

  handleKeyPress = btn => {
    switch (btn) {
      case '{shift}':
      case '{lock}':
        this.setState({ capitalized: !this.state.capitalized });
        break;
      case '{enter}':
        ipcRenderer.send('close-keyboard');
        break;
    }
  };

  render() {
    if (!this.state.options) return null;

    const {
      text,
      capitalized,
      options: { theme, maskable, placeholder },
    } = this.state;
    const themeWithMixer = {
      ...theme,
      mixer: getMixer(theme.background, theme.foreground),
    };
    const Input = maskable ? MaskableTextField : TextField;

    return (
      <ThemeProvider theme={themeWithMixer}>
        <KeyboardWrapper>
          <GlobalStyles />
          <KeyboardStyles />

          <InputWrapper>
            <Input
              readOnly
              value={text}
              onChange={this.handleInputChange}
              placeholder={placeholder}
              skin="filled-inverted"
              style={{ borderRadius: 5, fontSize: 18 }}
            />
          </InputWrapper>

          <Keyboard
            keyboardRef={keyboard => {
              if (!this.populated && this.state.options) {
                keyboard.setInput(this.state.options.defaultText);
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
            layoutName={capitalized ? 'shift' : 'default'}
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
            onChange={this.handleChange}
            onKeyPress={this.handleKeyPress}
            tabCharOnTab={false}
          />
        </KeyboardWrapper>
      </ThemeProvider>
    );
  }
}
