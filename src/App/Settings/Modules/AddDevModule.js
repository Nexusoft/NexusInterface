import React from 'react';
import styled from '@emotion/styled';
import { ipcRenderer } from 'electron';

import Button from 'components/Button';
import { openErrorDialog, openSuccessDialog } from 'lib/ui';
import { updateSettings } from 'lib/settings';
import store from 'store';
import { Module, addDevModule } from 'lib/modules';

const Wrapper = styled.div(({ theme }) => ({
  margin: '1em 0',
  color: theme.mixer(0.75),
  textAlign: 'center',
  fontSize: '.9em',
}));

async function handleClick() {
  const paths = await ipcRenderer.invoke('show-open-dialog', {
    title: __('Select development module directory'),
    properties: ['openDirectory'],
  });
  const dirPath = paths && paths[0];
  if (!dirPath) return;

  const {
    modules,
    settings: { devModulePaths },
  } = store.getState();
  if (devModulePaths.includes(dirPath)) {
    openErrorDialog({
      message: __('Directory has already been added'),
    });
  }

  const module = await Module.loadDevFromDir(dirPath);
  if (!module) {
    openErrorDialog({
      message: __('Invalid development module'),
    });
  }

  if (modules[module.info.name]) {
    openErrorDialog({
      message: __('A module with the same name already exists'),
    });
  }

  updateSettings({
    devModulePaths: [dirPath, ...devModulePaths],
  });
  addDevModule(module);
  openSuccessDialog({
    message: __('Development module has been added'),
  });
}

const AddDevModule = () => (
  <Wrapper>
    {__(
      'Your module is still in development? <link>Add a development module</link>',
      null,
      {
        link: txt => (
          <Button skin="hyperlink" onClick={handleClick}>
            {txt}
          </Button>
        ),
      }
    )}
  </Wrapper>
);

export default AddDevModule;
