// External
import React from 'react';
import Dropzone from 'react-dropzone';
import styled from '@emotion/styled';

// Internal
import Icon from 'components/Icon';
import FieldSet from 'components/FieldSet';
import Button from 'components/Button';
import { consts, timing } from 'styles';
import * as color from 'utils/color';
import plusCircleIcon from 'images/plus.sprite.svg';

import installModule from './installModule';

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

class AddModule extends React.Component {
  browseFiles = () => {
    remote.dialog.showOpenDialog(
      {
        title: 'Select module archive file',
        properties: ['openFile'],
        filters: [
          {
            name: 'ZIP Archive',
            extensions: ['zip'],
          },
        ],
      },
      paths => {
        if (paths && paths[0]) {
          installModule(paths[0]);
        }
      }
    );
  };

  browseDirectories = () => {
    remote.dialog.showOpenDialog(
      {
        title: 'Select module directory',
        properties: ['openDirectory'],
      },
      paths => {
        if (paths && paths[0]) {
          installModule(paths[0]);
        }
      }
    );
  };

  getFilesFromEvent = event => {
    if (!event || !event.dataTransfer) return [];
    if (event.type === 'drop') {
      console.log(event.type, Array.from(event.dataTransfer.files));
      return Array.from(event.dataTransfer.files);
    } else {
      console.log(event.type, Array.from(event.dataTransfer.items));
      return Array.from(event.dataTransfer.items);
    }
  };

  handleDrop = acceptedFiles => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      installModule(acceptedFiles[0].path);
    }
  };

  render() {
    return (
      <Dropzone
        getFilesFromEvent={this.getFilesFromEvent}
        onDrop={this.handleDrop}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          <AddModuleComponent
            {...getRootProps()}
            onClick={() => {}}
            legend={
              <>
                <Icon icon={plusCircleIcon} />
                <span className="v-align space-left">Add Module</span>
              </>
            }
            active={isDragActive}
          >
            <InnerMessage noPointerEvents={isDragActive}>
              {isDragActive ? (
                <div>Drop here to install</div>
              ) : (
                <div>
                  <div>
                    Select module{' '}
                    <Button skin="hyperlink" onClick={this.browseFiles}>
                      archive
                    </Button>{' '}
                    or{' '}
                    <Button skin="hyperlink" onClick={this.browseDirectories}>
                      directory
                    </Button>
                  </div>
                  <div>or drag and drop it here</div>
                </div>
              )}
            </InnerMessage>
            <input {...getInputProps()} />
          </AddModuleComponent>
        )}
      </Dropzone>
    );
  }
}

export default AddModule;
