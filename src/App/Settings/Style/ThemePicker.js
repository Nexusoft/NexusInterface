// External
import { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

//Internal
import { darkTheme, lightTheme, potTheme, setTheme } from 'lib/theme';
import { timing } from 'styles';
import * as color from 'utils/color';

__ = __context('Settings.Style');

const OptionButton = styled.button(
  ({ theme }) => ({
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    padding: '0 1em',
    marginRight: '0.4em',
    height: '2.8em',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    transitionProperty: 'border-color, color',
    transitionDuration: timing.normal,
    color: theme.foreground,

    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    transition: `background-color ${timing.normal}`,

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
  if (equals(theme, potTheme)) return 'pot';
  return 'custom';
}

export default function ThemePicker() {
  const theme = useSelector((state) => state.theme);
  const themeName = getName(theme);
  const [customTheme, setCustomTheme] = useState(null);

  return (
    <div>
      <OptionButton
        selected={themeName === 'dark'}
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
      </OptionButton>

      <OptionButton
        selected={themeName === 'light'}
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
      </OptionButton>

      <OptionButton
        selected={themeName === 'pot'}
        onClick={
          themeName !== 'pot'
            ? () => {
                if (themeName === 'custom') setCustomTheme(theme);
                setTheme(potTheme);
              }
            : undefined
        }
      >
        POT
      </OptionButton>

      {(customTheme || themeName === 'custom') && (
        <OptionButton
          selected={themeName === 'custom'}
          onClick={
            themeName !== 'custom'
              ? () => {
                  setTheme(customTheme);
                }
              : undefined
          }
        >
          {__('Custom')}
        </OptionButton>
      )}
    </div>
  );
}
