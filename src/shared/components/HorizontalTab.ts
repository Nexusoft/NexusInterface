/**
 * Important note - This file is imported into module_preload.js, either directly or
 * indirectly, and will be a part of the preload script for modules, therefore:
 * - Be picky with importing stuffs into this file, especially for big
 * files and libraries. The bigger the preload scripts get, the slower the modules
 * will load.
 * - Don't assign anything to `global` variable because it will be passed
 * into modules' execution environment.
 * - Make sure this note also presents in other files which are imported here.
 */

// External Dependencies
import styled from '@emotion/styled';

// Internal Global Dependencies
import { timing } from 'styles';

const HorizontalTabComponent = styled.div<{
  active?: boolean;
}>(
  ({ theme }) => ({
    flexGrow: 1,
    flexShrink: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 1.5em .75em',
    fontSize: '1.125em',
    color: theme.mixer(0.75),
    borderBottom: `1px solid ${theme.mixer(0.25)}`,
    transitionProperties: 'color, borderBottom',
    transitionDuration: timing.normal,
    cursor: 'pointer',

    '&:hover': {
      color: theme.foreground,
    },

    '&.active': {
      color: theme.primary,
      borderBottomColor: theme.primary,
    },
  }),
  ({ active, theme }) =>
    !!active && {
      '&, &:hover': {
        color: theme.primary,
        borderBottomColor: theme.primary,
      },
    }
);

const TabBar = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  margin: '0 0 1em',
  padding: 0,
});

type HorizontalTabType = typeof HorizontalTabComponent & {
  TabBar: typeof TabBar;
};
const HorizontalTab = HorizontalTabComponent as HorizontalTabType;
HorizontalTab.TabBar = TabBar;

export default HorizontalTab;
