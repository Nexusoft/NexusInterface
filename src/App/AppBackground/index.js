// External
import { useSelector } from 'react-redux';
import { existsSync } from 'fs';
import styled from '@emotion/styled';

// Internal
import { starryNightBackground, cosmicLightBackground } from 'lib/theme';
import StarrySky from './StarrySky';
import CosmicLight from './Light';

const CustomWallpaper = styled.div(
  {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
  },
  ({ wallpaper }) =>
    !!wallpaper && {
      backgroundImage: `url("${wallpaper}")`,
    }
);

export default function AppBackground() {
  const wallpaper = useSelector((state) => state.theme.wallpaper);

  if (wallpaper === starryNightBackground) {
    return <StarrySky />;
  }
  if (wallpaper === cosmicLightBackground) {
    return <CosmicLight />;
  }
  if (!!wallpaper && existsSync(wallpaper)) {
    return <CustomWallpaper wallpaper={wallpaper} />;
  }
  return <StarrySky />;
}
