// External
import React, { PureComponent } from 'react';
import { ThemeProvider } from 'emotion-theming';
import { connect } from 'react-redux';

// Internal
import { getMixer } from 'api/theme';

@connect(state => ({
  theme: state.theme,
}))
export default class ThemeController extends PureComponent {
  render() {
    const { theme } = this.props;
    const themeWithMixer = {
      ...theme,
      mixer: getMixer(theme.background, theme.foreground),
    };
    return (
      <ThemeProvider theme={themeWithMixer}>
        {this.props.children}
      </ThemeProvider>
    );
  }
}
