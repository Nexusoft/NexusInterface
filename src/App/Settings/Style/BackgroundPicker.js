// External
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
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

function handleFilePick(e) {
  if (!!e.target.files.length) {
    let imagePath = e.target.files[0]?.path;
    // Reset the input value, or onChange won't fire next time
    // if user selects the same file
    e.target.value = '';
    if (imagePath && process.platform === 'win32') {
      imagePath = imagePath.replace(/\\/g, '/');
    }
    updateTheme({ wallpaper: imagePath });
  }
}

export default function BackgroundPicker() {
  const wallpaper = useSelector((state) => state.theme.wallpaper);
  const fileInputID = useMemo(newUID, []);
  const customWallpaper =
    wallpaper !== starryNightBackground && wallpaper !== cosmicLightBackground;

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
      <Option htmlFor={fileInputID} selected={customWallpaper}>
        {customWallpaper ? (
          <span>
            {__('Custom wallpaper')}: {wallpaper}
          </span>
        ) : (
          __('Select a custom wallpaper')
        )}
      </Option>
      <input
        id={fileInputID}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFilePick}
      />
    </div>
  );
}
