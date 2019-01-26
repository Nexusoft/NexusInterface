// External
import React, { Component } from 'react';
import styled from '@emotion/styled';

// Internal
import Text from 'components/Text';
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

  setDefault = () => {
    this.props.onChange(null);
  };

  handleFilePick = e => {
    if (!!e.target.files.length) {
      let imagePath = e.target.files[0].path;
      if (process.platform === 'win32') {
        imagePath = imagePath.replace(/\\/g, '/');
      }
      console.log(imagePath);
      this.props.onChange(imagePath);
    }
  };

  render() {
    const { wallpaper } = this.props;
    return (
      <div>
        <Option
          onClick={this.setDefault}
          selected={!wallpaper}
          style={{ marginBottom: '.5em' }}
        >
          <Text id="Settings.StarryBackground" />
        </Option>
        <Option htmlFor={this.fileInputID} selected={!!wallpaper}>
          {wallpaper ? (
            <span>
              <Text id="Settings.CustomWallpaper" />: {wallpaper}
            </span>
          ) : (
            <Text id="Settings.SelectCustomWallpaper" />
          )}
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
