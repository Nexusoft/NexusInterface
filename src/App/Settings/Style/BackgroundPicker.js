// External
import { useSelector } from 'react-redux';
import { ipcRenderer } from 'electron';
import styled from '@emotion/styled';
import { fade } from 'utils/color';

// Internal
import Button from 'components/Button';
import {
  starryNightBackground,
  cosmicLightBackground,
  nexusThemeBackground,
  blackBackground,
  updateTheme,
} from 'lib/theme';

__ = __context('Settings.Style');

const CustomWallpaperButton = styled(Button)(({ theme }) => theme.modern && ({
  '&&&&&&': {
    color: theme.primary,
    background: fade(theme.primary, 0.9),
    border: '1px solid transparent',
    transition: 'background 150ms ease, border-color 150ms ease',
    '&:hover:not(:disabled)': {
      color: theme.primary,
      background: fade(theme.primary, 0.82),
      borderColor: fade(theme.primary, 0.65),
    },
    '&:active:not(:disabled)': {
      background: fade(theme.primary, 0.75),
    },
  },
}));

async function handleFilePick(e) {
  const files = await ipcRenderer.invoke('show-open-dialog', {
    title: __('Select wallpaper'),
    properties: ['openFile'],
    filters: [
      {
        name: 'Images',
        extensions: ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'],
      },
    ],
  });
  let path = files?.[0];
  if (path) {
    if (process.platform === 'win32') {
      path = path.replace(/\\/g, '/');
    }
    updateTheme({ wallpaper: path });
  }
}

export default function BackgroundPicker() {
  const wallpaper = useSelector((state) => state.theme.wallpaper);
  const customWallpaper =
    wallpaper !== blackBackground &&
    wallpaper !== starryNightBackground &&
    wallpaper !== cosmicLightBackground &&
    wallpaper !== nexusThemeBackground;

  return (
    <div>
      <Button
        skin={wallpaper === blackBackground ? 'filled-primary' : 'plain'}
        className="mr1"
        onClick={() => updateTheme({ wallpaper: blackBackground })}
        selected={wallpaper === blackBackground}
        style={{ display: 'inline', marginBottom: '.5em' }}
      >
        {__('Tracer')}
      </Button>
      <Button
        skin={wallpaper === starryNightBackground ? 'filled-primary' : 'plain'}
        className="mr1"
        onClick={() => updateTheme({ wallpaper: starryNightBackground })}
        selected={wallpaper === starryNightBackground}
        style={{ display: 'inline', marginBottom: '.5em' }}
      >
        {__('Starry night')}
      </Button>
      <Button
        skin={wallpaper === cosmicLightBackground ? 'filled-primary' : 'plain'}
        className="mr1"
        onClick={() => updateTheme({ wallpaper: cosmicLightBackground })}
        selected={wallpaper === cosmicLightBackground}
        style={{ display: 'inline', marginBottom: '.5em' }}
      >
        {__('Cosmic light')}
      </Button>
      <Button
        skin={wallpaper === nexusThemeBackground ? 'filled-primary' : 'plain'}
        className="mr1"
        onClick={() => updateTheme({ wallpaper: nexusThemeBackground })}
        selected={wallpaper === nexusThemeBackground}
        style={{ display: 'inline', marginBottom: '.5em' }}
      >
        {__('Nexus.io')}
      </Button>
      <CustomWallpaperButton
        skin={customWallpaper ? 'filled-primary' : 'plain'}
        className="mr1"
        selected={customWallpaper}
        onClick={handleFilePick}
      >
        {customWallpaper ? (
          <span>
            {__('Custom wallpaper')}: {wallpaper}
          </span>
        ) : (
          __('Select a custom wallpaper')
        )}
      </CustomWallpaperButton>
    </div>
  );
}
