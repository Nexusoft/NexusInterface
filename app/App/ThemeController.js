// External
import React, { PureComponent } from 'react';
import { ThemeProvider } from 'emotion-theming';
import { connect } from 'react-redux';

// Internal
import { colors } from 'styles';

const mapStateToProps = state => ({
  customColors: state.settings.settings.customStyling,
});

class ThemeController extends PureComponent {
  render() {
    console.log('Colors updated', this.props.customColors);
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
