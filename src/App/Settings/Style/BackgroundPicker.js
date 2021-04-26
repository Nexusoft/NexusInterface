// External
import { Component } from 'react';
import styled from '@emotion/styled';

// Internal
import {
  starryNightBackground,
  cosmicLightBackground,
  updateTheme,
} from 'lib/theme';
import { timing } from 'styles';
import { newUID } from 'utils/misc';
import * as color from 'utils/color';

__ = __context('Settings.Style');

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
        color: theme.primaryAccent,
      },
    }
);

/**
 * The Background Picker Element
 *
 * @class BackgroundPicker
 * @extends {Component}
 */
class BackgroundPicker extends Component {
  fileInputID = newUID();

  /**
   * Handle Picking a file
   *
   * @memberof BackgroundPicker
   */
  handleFilePick = (e) => {
    console.log(1, e.target.files);
    if (!!e.target.files.length) {
      let imagePath = e.target.files[0].path;
      console.log(2, imagePath);
      if (process.platform === 'win32') {
        imagePath = imagePath.replace(/\\/g, '/');
      }
      console.log(3, imagePath);
      updateTheme({ wallpaper: imagePath });
      console.log(4);
    }
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof BackgroundPicker
   */
  render() {
    const { wallpaper, defaultStyle } = this.props;
    const customWallpaper =
      wallpaper !== starryNightBackground &&
      wallpaper !== cosmicLightBackground;
    return (
      <div>
        <Option
          onClick={() => updateTheme({ wallpaper: starryNightBackground })}
          selected={wallpaper === starryNightBackground}
          style={{ display: 'inline', marginBottom: '.5em' }}
        >
          {__('Starry night')}
        </Option>
        <Option
          onClick={() => updateTheme({ wallpaper: cosmicLightBackground })}
          selected={wallpaper === cosmicLightBackground}
          style={{ display: 'inline', marginBottom: '.5em' }}
        >
          {__('Cosmic light')}
        </Option>
        <Option htmlFor={this.fileInputID} selected={customWallpaper}>
          {customWallpaper ? (
            <span>
              {__('Custom wallpaper')}: {wallpaper}
            </span>
          ) : (
            __('Select a custom wallpaper')
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
