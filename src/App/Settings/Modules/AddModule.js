// External
import { useState } from 'react';
import Dropzone from 'react-dropzone';
import styled from '@emotion/styled';
import { ipcRenderer } from 'electron';

// Internal
import { installModule } from 'lib/modules';
import Icon from 'components/Icon';
import FieldSet from 'components/FieldSet';
import Button from 'components/Button';
import { consts, timing } from 'styles';
import * as color from 'utils/color';
import plusCircleIcon from 'icons/plus.svg';

__ = __context('Settings.Modules');

const AddModuleComponent = styled(FieldSet)(
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

const InnerMessage = styled.div(
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
 * Override react-dropzone's default getFilesFromEvent function because
 * by default the full paths of dropped files are tripped off
 *
 */
function getFilesFromEvent(event) {
  if (!event || !event.dataTransfer) return [];
  if (event.type === 'drop') {
    return Array.from(event.dataTransfer.files);
  } else {
    return Array.from(event.dataTransfer.items);
  }
}

/**
 * The Add Module section in Modules Settings tab
 */
export default function AddModule() {
  const [checking, setChecking] = useState(false);

  const startInstall = async (path) => {
    setChecking(true);
    try {
      await installModule(path);
    } finally {
      setChecking(false);
    }
  };

  const browseFiles = async () => {
    const paths = await ipcRenderer.invoke('show-open-dialog', {
      title: __('Select module archive file'),
      properties: ['openFile'],
      filters: [
        {
          name: 'Archive',
          extensions: ['zip', 'tar.gz'],
        },
      ],
    });
    if (paths && paths[0]) {
      startInstall(paths[0]);
    }
  };

  const browseDirectories = async () => {
    const paths = await ipcRenderer.invoke('show-open-dialog', {
      title: __('Select module directory'),
      properties: ['openDirectory'],
    });
    if (paths && paths[0]) {
      startInstall(paths[0]);
    }
  };

  const handleDrop = (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      startInstall(acceptedFiles[0].path);
    }
  };

  return (
    <Dropzone getFilesFromEvent={getFilesFromEvent} onDrop={handleDrop}>
      {({ getRootProps, getInputProps, isDragActive }) => (
        <AddModuleComponent
          {...getRootProps()}
          onClick={
            /* disable dropzone's default file browsing dialog on click */ () => {}
          }
          legend={
            <>
              <Icon icon={plusCircleIcon} />
              <span className="v-align ml0_4">{__('Add Module')}</span>
            </>
          }
          active={isDragActive || checking}
        >
          <InnerMessage noPointerEvents={isDragActive || checking}>
            {checking ? (
              <div>{__('Checking module')}...</div>
            ) : isDragActive ? (
              <div>{__('Drop here to install')}</div>
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
                <div>{__('or drag and drop it here')}</div>
              </div>
            )}
          </InnerMessage>
          <input {...getInputProps()} />
        </AddModuleComponent>
      )}
    </Dropzone>
  );
}
