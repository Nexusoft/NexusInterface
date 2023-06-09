// External
import { useSelector } from 'react-redux';
import { existsSync } from 'fs';
import styled from '@emotion/styled';

// Internal
import { starryNightBackground, cosmicLightBackground, nexusThemeBackground } from 'lib/theme';
import StarryNight from './StarryNight';
import NexusThemeBg from './Particles';
import lightImg from './Light_Space.jpg';


const CustomWallpaper = styled.div(
  {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundPosition: 'center center',
  },
  ({ image }) =>
    !!image && {
      backgroundImage: `url("${image}")`,
    },
  ({ size = 'cover', backgroundColor = '#000' }) => ({
    backgroundSize: size,
    backgroundColor,
  })
);

export default function AppBackground() {
  const { wallpaper, wallpaperSize, wallpaperBackgroundColor } = useSelector(
    (state) => state.theme
  );

  if (wallpaper === starryNightBackground) {
    return <StarryNight />;
  }
  if (wallpaper === cosmicLightBackground) {
    return (
      <CustomWallpaper
        image={lightImg}
        size={wallpaperSize}
        backgroundColor={wallpaperBackgroundColor}
      />
    );
  }

  if (wallpaper === nexusThemeBackground) {
    return <NexusThemeBg />;   
  }

  if (!!wallpaper && existsSync(wallpaper)) {
    return (
      <CustomWallpaper
        image={wallpaper}
        size={wallpaperSize}
        backgroundColor={wallpaperBackgroundColor}
      />
    );
  }
  return <StarryNight />;
}
