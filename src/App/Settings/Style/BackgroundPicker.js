// External
import React, { Component } from 'react';
import styled from '@emotion/styled';

// Internal
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
   * Set a Default background
   *
   * @memberof BackgroundPicker
   */
  setDefault = version => {
    if (this.props.defaultStyle != version) {
      version = version + 'Custom';
    }
    this.props.onChange(null, version);
  };

  /**
   * Handle Picking a file
   *
   * @memberof BackgroundPicker
   */
  handleFilePick = e => {
    if (!!e.target.files.length) {
      let imagePath = e.target.files[0].path;
      if (process.platform === 'win32') {
        imagePath = imagePath.replace(/\\/g, '/');
      }

      this.props.onChange(imagePath, 'Custom');
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
    return (
      <div>
        <Option
          onClick={() => this.setDefault('Dark')}
          selected={!wallpaper && defaultStyle.startsWith('Dark')}
          style={{ display: 'inline', marginBottom: '.5em' }}
        >
          {__('Twinkling stars')}
        </Option>
        <Option
          onClick={() => this.setDefault('Light')}
          selected={!wallpaper && defaultStyle.startsWith('Light')}
          style={{ display: 'inline', marginBottom: '.5em' }}
        >
          {__('Cosmic light')}
        </Option>
        <Option htmlFor={this.fileInputID} selected={!!wallpaper}>
          {wallpaper ? (
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
