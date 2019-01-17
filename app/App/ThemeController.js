// External
import React, { PureComponent } from 'react';
import { ThemeProvider } from 'emotion-theming';
import { connect } from 'react-redux';

// Internal
import { colors } from 'styles';

const mapStateToProps = state => ({
  customColors: state.settings.theme,
});

class ThemeController extends PureComponent {
  render() {
    const newColors = colors.derive({
      ...colors.default,
      ...this.props.customColors,
    });
    return (
      <ThemeProvider theme={newColors}>{this.props.children}</ThemeProvider>
    );
  }
}

export default connect(mapStateToProps)(ThemeController);
