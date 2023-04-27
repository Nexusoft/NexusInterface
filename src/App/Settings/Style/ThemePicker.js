// External
import { useState } from 'react';
import { useSelector } from 'react-redux';

//Internal
import Button from 'components/Button';
import { darkTheme, lightTheme, setTheme } from 'lib/theme';

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
  return 'custom';
}

export default function ThemePicker() {
  const theme = useSelector((state) => state.theme);
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
