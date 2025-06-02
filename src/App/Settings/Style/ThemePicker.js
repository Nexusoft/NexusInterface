// External
import { useState } from 'react';
import { useAtomValue } from 'jotai';

//Internal
import Button from 'components/Button';
import {
  darkTheme,
  lightTheme,
  nexusTheme,
  setTheme,
  themeAtom,
} from 'lib/theme';

__ = __context('Settings.Style');

function equals(theme1, theme2) {
  if (theme1 === theme2) return true;
  const entries1 = Object.entries(theme1);
  if (entries1.length !== Object.keys(theme2).length) return false;
  for (const [key, value] of entries1) {
    if (theme2[key] !== value) return false;
  }
  return true;
}

function getName(theme) {
  if (equals(theme, darkTheme)) return 'dark';
  if (equals(theme, lightTheme)) return 'light';
  if (equals(theme, nexusTheme)) return 'nexus';
  return 'custom';
}

export default function ThemePicker() {
  const theme = useAtomValue(themeAtom);
  const themeName = getName(theme);
  const [customTheme, setCustomTheme] = useState(null);

  return (
    <div>
      <Button
        skin={themeName === 'dark' ? 'filled-primary' : 'plain'}
        className="mr1"
        onClick={
          themeName !== 'dark'
            ? () => {
                if (themeName === 'custom') setCustomTheme(theme);
                setTheme(darkTheme);
              }
            : undefined
        }
      >
        {__('Dark')}
      </Button>

      <Button
        skin={themeName === 'light' ? 'filled-primary' : 'plain'}
        className="mr1"
        onClick={
          themeName !== 'light'
            ? () => {
                if (themeName === 'custom') setCustomTheme(theme);
                setTheme(lightTheme);
              }
            : undefined
        }
      >
        {__('Light')}
      </Button>

      <Button
        skin={themeName === 'nexus' ? 'filled-primary' : 'plain'}
        className="mr1"
        onClick={
          themeName !== 'nexus'
            ? () => {
                if (themeName === 'custom') setCustomTheme(theme);
                setTheme(nexusTheme);
              }
            : undefined
        }
      >
        {__('Nexus.io')}
      </Button>

      {(customTheme || themeName === 'custom') && (
        <Button
          skin={themeName === 'custom' ? 'filled-primary' : 'plain'}
          onClick={
            themeName !== 'custom'
              ? () => {
                  setTheme(customTheme);
                }
              : undefined
          }
        >
          {__('Custom')}
        </Button>
      )}
    </div>
  );
}
