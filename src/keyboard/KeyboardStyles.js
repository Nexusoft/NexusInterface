import React from 'react';
import { Global } from '@emotion/core';

import { timing } from 'styles';

const KeyboardStyles = () => (
  <Global
    styles={theme => ({
      '.simple-keyboard.hg-theme-default': {
        background: theme.background,
        fontFamily: '"Noto Sans", sans-serif',

        '.hg-button': {
          background: theme.mixer(0.125),
          color: theme.mixer(0.875),
          borderBottomColor: theme.mixer(0.5),
          transition: `background ${timing.normal}`,

          '&:hover': {
            background: theme.mixer(0.25),
          },

          '&:active': {
            background: theme.mixer(0.15),
          },
        },
      },
    })}
  />
);

export default KeyboardStyles;
