// External
import { useState } from 'react';
import styled from '@emotion/styled';

// Internal
import { installModule } from 'lib/modules';
import Icon from 'components/Icon';
import FieldSet from 'components/FieldSet';
import Button from 'components/Button';
import { consts, timing } from 'styles';
import * as color from 'utils/color';
import plusCircleIcon from 'icons/plus.svg';

__ = __context('Settings.Modules');

const styledFieldSet = styled(FieldSet);

const AddModuleComponent = styledFieldSet<{ active?: boolean }>(
  ({ theme }) => ({
    textAlign: 'center',
    fontSize: '.9em',
    color: theme.mixer(0.75),
    borderColor: theme.mixer(0.375),
    margin: '0 0 1em',
    outline: 'none',
    transitionProperty: 'color, border-color, background-color',
    transitionDuration: timing.normal,
    '&:hover': {
      color: theme.mixer(0.75),
    },
  }),
  ({ active, theme }) =>
    active && {
      background: color.fade(theme.foreground, 0.9),
      color: theme.mixer(0.875),
      borderColor: theme.mixer(0.5),
    }
);

const InnerMessage = styled.div<{ noPointerEvents?: boolean }>(
  {
    height: consts.lineHeight * 2 + 'em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ({ noPointerEvents }) =>
    noPointerEvents && {
      pointerEvents: 'none',
    }
);

/**
 * The Add Module section in Modules Settings tab
 */
export default function AddModule() {
  const [checking, setChecking] = useState(false);

  const startInstall = async (path: string) => {
    setChecking(true);
    try {
      await installModule(path);
    } finally {
      setChecking(false);
    }
  };

  const browseFiles = async () => {
    const paths = await window.nexusElectron.dialogs.selectModuleArchive();
    if (paths && paths[0]) {
      startInstall(paths[0]);
    }
  };

  const browseDirectories = async () => {
    const paths = await window.nexusElectron.dialogs.selectModuleDirectory();
    if (paths && paths[0]) {
      startInstall(paths[0]);
    }
  };

  return (
    <AddModuleComponent
      legend={
        <>
          <Icon icon={plusCircleIcon} />
          <span className="v-align ml0_4">{__('Add Module')}</span>
        </>
      }
      active={checking}
    >
      <InnerMessage noPointerEvents={checking}>
        {checking ? (
          <div>{__('Checking module')}...</div>
        ) : (
          <div>
            <div>
              {__(
                "Select module's <file>archive file</file> or <dir>directory</dir>",
                undefined,
                {
                  file: (txt) => (
                    <Button skin="hyperlink" onClick={browseFiles}>
                      {txt}
                    </Button>
                  ),
                  dir: (txt) => (
                    <Button skin="hyperlink" onClick={browseDirectories}>
                      {txt}
                    </Button>
                  ),
                }
              )}
            </div>
          </div>
        )}
      </InnerMessage>
    </AddModuleComponent>
  );
}
