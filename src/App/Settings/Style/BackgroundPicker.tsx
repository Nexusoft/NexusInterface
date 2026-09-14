// External
import { useAtomValue } from 'jotai';

// Internal
import Button from 'components/Button';
import {
  starryNightBackground,
  cosmicLightBackground,
  nexusThemeBackground,
  updateTheme,
  themeAtom,
} from 'lib/theme';

__ = __context('Settings.Style');

async function handleFilePick() {
  const wallpaper = await window.nexusElectron.theme.selectWallpaper();
  if (wallpaper) {
    updateTheme({ wallpaper });
  }
}

export default function BackgroundPicker() {
  const wallpaper = useAtomValue(themeAtom)?.wallpaper;
  const customWallpaper =
    wallpaper !== starryNightBackground &&
    wallpaper !== cosmicLightBackground &&
    wallpaper !== nexusThemeBackground;

  return (
    <div>
      <Button
        skin={wallpaper === starryNightBackground ? 'filled-primary' : 'plain'}
        className="mr1"
        onClick={() => updateTheme({ wallpaper: starryNightBackground })}
        // selected={wallpaper === starryNightBackground}
        style={{ display: 'inline', marginBottom: '.5em' }}
      >
        {__('Starry night')}
      </Button>
      <Button
        skin={wallpaper === cosmicLightBackground ? 'filled-primary' : 'plain'}
        className="mr1"
        onClick={() => updateTheme({ wallpaper: cosmicLightBackground })}
        // selected={wallpaper === cosmicLightBackground}
        style={{ display: 'inline', marginBottom: '.5em' }}
      >
        {__('Cosmic light')}
      </Button>
      <Button
        skin={wallpaper === nexusThemeBackground ? 'filled-primary' : 'plain'}
        className="mr1"
        onClick={() => updateTheme({ wallpaper: nexusThemeBackground })}
        // selected={wallpaper === nexusThemeBackground}
        style={{ display: 'inline', marginBottom: '.5em' }}
      >
        {__('Nexus.io')}
      </Button>
      <Button
        skin={customWallpaper ? 'filled-primary' : 'plain'}
        className="mr1"
        // selected={customWallpaper}
        onClick={handleFilePick}
      >
        {customWallpaper ? (
          <span>
            {__('Custom wallpaper')}: {wallpaper}
          </span>
        ) : (
          __('Select a custom wallpaper')
        )}
      </Button>
    </div>
  );
}
