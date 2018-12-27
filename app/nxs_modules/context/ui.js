import React from 'react';

const UIContext = React.createContext({
  openModal: () => {},
  closeModal: () => {},
  openConfirmModal: () => {},
  openErrorModal: () => {},
});

export default UIContext;
