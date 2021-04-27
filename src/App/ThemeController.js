// External
import { PureComponent } from 'react';
import { ThemeProvider } from '@emotion/react';
import { connect } from 'react-redux';

// Internal
import { fortifyTheme } from 'lib/theme';

/**
 * Controls the theme using {Emotion}
 *
 * @class ThemeController
 * @extends {PureComponent}
 */
@connect((state) => ({
  theme: state.theme,
}))
class ThemeController extends PureComponent {
  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof ThemeController
   */
  render() {
    const { theme } = this.props;
    return (
      <ThemeProvider theme={fortifyTheme(theme)}>
        {this.props.children}
      </ThemeProvider>
    );
  }
}
export default ThemeController;
