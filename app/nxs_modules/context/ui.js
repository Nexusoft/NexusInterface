import React from 'react';

const UIContext = React.createContext({
  modalID: null,
  openModal: () => {},
  closeModal: () => {},
  openConfirmModal: () => {},
  openErrorModal: () => {},
  openSuccessModal: () => {},

  showNotification: () => {},
  hideNotification: () => {},
});

export default UIContext;
