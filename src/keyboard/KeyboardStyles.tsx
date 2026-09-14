import { Global } from '@emotion/react';

import { timing } from 'styles';
import * as color from 'utils/color';

export default function KeyboardStyles() {
  return (
    <Global
      styles={(theme) => ({
        body: {
          background: theme.background,
        },

        '.simple-keyboard.hg-theme-default': {
          background: theme.background,
          fontFamily: '"Noto Sans", sans-serif',

          '.hg-button': {
            '&': {
              background: theme.mixer(0.125),
              color: theme.mixer(0.875),
              borderBottomColor: theme.mixer(0.5),
              transition: `background ${timing.normal}`,
            },
            '&:hover': {
              background: theme.mixer(0.25),
            },
            '&:active': {
              background: theme.mixer(0.125),
            },

            '&.btn-submit': {
              '&': {
                background: theme.lower(theme.primary, 0.2),
                color: theme.primaryAccent,
                borderBottomColor: color.mix(
                  theme.primaryAccent,
                  theme.primary
                ),
              },
              '&:hover': {
                background: theme.lower(theme.primary, 0.1),
              },
              '&:active': {
                background: theme.lower(theme.primary, 0.2),
              },
            },
          },
        },
      })}
    />
  );
}
