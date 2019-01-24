// External
import React, { Component } from 'react';
import styled from '@emotion/styled';
// Internal
import { timing } from 'styles';
import { color, newUID } from 'utils';

const Option = styled.label(
  ({ theme }) => ({
    display: 'block',
    padding: '.4em .8em',
    transition: `background-color ${timing.normal}`,
    cursor: 'pointer',

    '&:hover': {
      background: theme.background,
    },
  }),
  ({ selected, theme }) =>
    selected && {
      '&, &:hover': {
        background: color.darken(theme.primary, 0.2),
      },
    }
);

class BackgroundPicker extends Component {
  fileInputID = newUID();

  setDefault = (version) => {
    if (this.props.defaultStyle != version) {
      version = version + 'Custom';
    }
    this.props.onChange(null, version);
  };

  handleFilePick = e => {
    if (!!e.target.files.length) {
      let imagePath = e.target.files[0].path;
      if (process.platform === 'win32') {
        imagePath = imagePath.replace(/\\/g, '/');
      }
      console.log(imagePath);
      this.props.onChange(imagePath, 'Custom');
    }
  };

  render() {
    const { wallpaper, defaultStyle } = this.props;
    return (
      <div>
        <Option
          onClick={() => this.setDefault('Dark')}
          selected={!wallpaper && defaultStyle.startsWith('Dark')}
          style={{ display: 'inline', marginBottom: '.5em' }}
        >
          Twinkling Starry Sky
        </Option>
        <Option
          onClick={() => this.setDefault('Light')}
          selected={!wallpaper && defaultStyle.startsWith('Light')}
          style={{ display: 'inline', marginBottom: '.5em' }}
        >
          Light Space Abstract
        </Option>
        <Option htmlFor={this.fileInputID} selected={!!wallpaper}>
          {wallpaper
            ? `Custom Wallpaper: ${wallpaper}`
            : 'Select a Custom Wallpaper'}
        </Option>
        <input
          id={this.fileInputID}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={this.handleFilePick}
        />
      </div>
    );
  }
}

export default BackgroundPicker;
