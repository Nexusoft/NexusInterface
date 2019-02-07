// External
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import styled from '@emotion/styled';
import { ChromePicker } from 'react-color';
import { withTheme } from 'emotion-theming';

// Internal
import Button from 'components/Button';
import Overlay from 'components/Overlay';
import { color } from 'utils';

const ColorButton = styled(Button)(({ color: c, open }) => {
  const contrastColor = color.isDark(c) ? '#fff' : '#000';
  return {
    '&, &:active, &&[disabled]': {
      background: c,
      color: open ? contrastColor : color.fade(contrastColor, 0.3),
      border: `1px solid ${
        open ? contrastColor : color.fade(contrastColor, 0.3)
      }`,
      transitionProperty: 'color, border-color',
    },
    '&:hover': {
      color: contrastColor,
      borderColor: contrastColor,
    },
  };
});

/**
 * Pick Color Element
 *
 * @class ColorPicker
 * @extends {Component}
 */
class ColorPicker extends Component {
  state = {
    open: false,
    pickerStyles: {},
  };

  /**
   * Open Color Modal
   *
   * @memberof ColorPicker
   */
  openPicker = () => {
    const btnRect = ReactDOM.findDOMNode(this.btnRef).getBoundingClientRect();
    const styles = {
      position: 'fixed',
      left: btnRect.right + 10,
      top: (btnRect.top + btnRect.bottom) / 2,
      transform: 'translateY(-50%)',
    };
    this.setState({ open: true, pickerStyles: styles });
  };

  /**
   * Close Modal
   *
   * @memberof ColorPicker
   */
  closePicker = () => {
    this.setState({ open: false, pickerStyles: {} });
  };

  /**
   * Handle Color Change
   *
   * @memberof ColorPicker
   */
  handleColorChange = pickedColor => {
    this.props.onChange(this.props.colorName, pickedColor.hex);
  };

  /**
   * React Render
   *
   * @returns
   * @memberof ColorPicker
   */
  render() {
    const currentColor = this.props.theme[this.props.colorName];

    return (
      <>
        <ColorButton
          ref={el => {
            this.btnRef = el;
          }}
          uppercase
          color={currentColor}
          open={this.state.open}
          onClick={this.openPicker}
          {...this.props}
        >
          {currentColor}
        </ColorButton>
        {this.state.open && (
          <Overlay onBackgroundClick={this.closePicker}>
            <div style={this.state.pickerStyles}>
              <ChromePicker
                color={currentColor}
                disableAlpha={true}
                onChangeComplete={this.handleColorChange}
              />
            </div>
          </Overlay>
        )}
      </>
    );
  }
}

export default withTheme(ColorPicker);
