// External
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import styled from '@emotion/styled';
import { ChromePicker } from 'react-color';

// Internal
import Button from 'components/Button';
import Overlay from 'components/Overlay';
import { color } from 'utils';

const ColorButton = styled(Button)(({ color: c }) => {
  const contrastColor = color.isDark(c) ? '#fff' : '#000';
  return {
    '&, &:active, &&[disabled]': {
      background: c,
      color: color.fade(contrastColor, 0.3),
      border: `1px solid ${color.fade(contrastColor, 0.3)}`,
      transitionProperty: 'color, border-color',
    },
    '&:hover': {
      color: contrastColor,
      borderColor: contrastColor,
    },
  };
});

export default class ColorPicker extends Component {
  state = {
    open: false,
    pickerStyles: {},
  };

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

  closePicker = () => {
    this.setState({ open: false, pickerStyles: {} });
  };

  render() {
    return (
      <>
        <ColorButton
          ref={el => {
            this.btnRef = el;
          }}
          uppercase
          onClick={this.openPicker}
          {...this.props}
        >
          {this.props.color}
        </ColorButton>
        {this.state.open && (
          <Overlay onBackgroundClick={this.closePicker}>
            <div style={this.state.pickerStyles}>
              <ChromePicker
                color={this.props.color}
                disableAlpha={true}
                onChangeComplete={this.props.onChange}
              />
            </div>
          </Overlay>
        )}
      </>
    );
  }
}
