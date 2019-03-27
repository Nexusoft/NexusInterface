// External
import React from 'react';
import Dropzone from 'react-dropzone';
import styled from '@emotion/styled';

// Internal
import Icon from 'components/Icon';
import FieldSet from 'components/FieldSet';
import { consts, timing } from 'styles';
import * as color from 'utils/color';
import plusCircleIcon from 'images/plus.sprite.svg';

import installModule from './installModule';

const AddModuleComponent = styled(FieldSet)(
  ({ theme }) => ({
    textAlign: 'center',
    cursor: 'pointer',
    fontSize: '.9em',
    color: theme.mixer(0.5),
    margin: '0 0 1em',
    outline: 'none',
    transitionProperty: 'color, border-color, background-color',
    transitionDuration: timing.normal,
    '&:hover': {
      color: theme.mixer(0.75),
      borderColor: theme.mixer(0.375),
    },
  }),
  ({ active, theme }) =>
    active && {
      background: color.fade(theme.foreground, 0.9),
      color: theme.mixer(0.75),
      borderColor: theme.mixer(0.375),
    }
);

const InnerMessage = styled.div({
  pointerEvents: 'none',
  height: consts.lineHeight * 2 + 'em',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

class AddModule extends React.Component {
  browseFiles = () => {
    remote.dialog.showOpenDialog(
      {
        title: 'Select module directory or archive',
        properties: ['openFile', 'openDirectory'],
      },
      paths => {
        if (paths && paths[0]) {
          installModule(paths[0]);
        }
      }
    );
  };

  getFilesFromEvent = event => {
    if (event.type === 'drop') {
      return Array.from(event.dataTransfer.files);
    } else {
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
      <Dropzone getFilesFromEvent={this.getFilesFromEvent}>
        {({ getRootProps, getInputProps, isDragActive }) => (
          <AddModuleComponent
            {...getRootProps()}
            legend={
              <>
                <Icon icon={plusCircleIcon} />
                <span className="v-align space-left">Add Module</span>
              </>
            }
            onClick={this.browseFiles}
            active={isDragActive}
          >
            <InnerMessage>
              {isDragActive ? (
                <div>Drop here to install</div>
              ) : (
                <div>
                  <div>Select module directory or .zip file</div>
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
