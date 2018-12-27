import React from 'react';

const UIContext = React.createContext({
  modalID: null,
  openModal: () => {},
  closeModal: () => {},
  openConfirmModal: () => {},
  openErrorModal: () => {},

  showNotification: () => {},
  hideNotification: () => {},
});

export default UIContext;
