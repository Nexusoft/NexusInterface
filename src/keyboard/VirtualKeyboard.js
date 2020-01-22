import React from 'react';
import { ipcRenderer } from 'electron';
import { ThemeProvider } from 'emotion-theming';
import Keyboard from 'react-simple-keyboard';
import styled from '@emotion/styled';

import GlobalStyles from 'components/GlobalStyles';
import TextField from 'components/TextField';
import MaskableTextField from 'components/MaskableTextField';
import Button from 'components/Button';
import { getMixer } from 'utils/color';

import KeyboardStyles from './KeyboardStyles';

const KeyboardWrapper = styled.div({
  padding: 5,
});

const InputWrapper = styled.div({
  padding: 5,
  display: 'grid',
  gridTemplateColumns: '1fr min-content',
  columnGap: 5,
  alignItems: 'stretch',
});

export default class App extends React.Component {
  state = {
    options: null,
  };

  constructor(props) {
    super(props);
    ipcRenderer.once('options', (evt, options) => {
      this.setState({ options });
    });
  }

  render() {
    if (!this.state.options) return null;

    const { theme, defaultText, maskable, placeholder } = this.state.options;
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
              defaultValue={defaultText}
              placeholder={placeholder}
              skin="filled-inverted"
              style={{ borderRadius: 5, fontSize: 18 }}
            />
            <Button skin="primary" fitHeight>
              Submit
            </Button>
          </InputWrapper>
          <Keyboard />
        </KeyboardWrapper>
      </ThemeProvider>
    );
  }
}
