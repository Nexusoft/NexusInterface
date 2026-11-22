// External
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { readFile } from 'fs';
import { extname } from 'path';
import styled from '@emotion/styled';

// Internal
import { starryNightBackground, cosmicLightBackground, nexusThemeBackground, blackBackground } from 'lib/theme';
import StarryNight from './StarryNight';
import NexusThemeBg from './Particles';
import lightImg from './Light_Space.jpg';


const CustomWallpaper = styled.div(
  {
    position: 'fixed',
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

const imageTypes = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.bmp': 'image/bmp', '.gif': 'image/gif',
};

export function LocalWallpaper({ path, ...props }) {
  const [loaded, setLoaded] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl;
    // Read via Node so local images work in both HTTP development and packaged apps.
    readFile(path, (error, data) => {
      if (cancelled) return;
      if (error) {
        setLoaded({ path, error: true });
        return;
      }
      objectUrl = URL.createObjectURL(new Blob([data], {
        type: imageTypes[extname(path).toLowerCase()] || 'application/octet-stream',
      }));
      setLoaded({ path, url: objectUrl });
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path]);

  if (loaded?.path === path && loaded.error) return <StarryNight />;
  return <CustomWallpaper {...props} image={loaded?.path === path ? loaded.url : undefined} />;
}

export default function AppBackground() {
  const { wallpaper, wallpaperSize, wallpaperBackgroundColor } = useSelector(
    (state) => state.theme
  );

  if (wallpaper === blackBackground) {
    return <CustomWallpaper backgroundColor="#000000" />;
  }
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

  if (wallpaper) {
    return (
      <LocalWallpaper
        path={wallpaper}
        size={wallpaperSize}
        backgroundColor={wallpaperBackgroundColor}
      />
    );
  }
  return <StarryNight />;
}
