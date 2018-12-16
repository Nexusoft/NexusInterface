// External Dependencies
import React from 'react';
import Modal from 'react-responsive-modal';
import { FormattedMessage } from 'react-intl';

function modalContent(modaltype) {
  switch (modaltype) {
    case 'This is an address registered to this wallet':
      return (
        <FormattedMessage
          id="Alert.registeredToThis"
          defaultMessage="This is an address registered to this wallet"
        />
      );
      break;
    case 'Invalid Address':
      return (
        <FormattedMessage
          id="Alert.InvalidAddress"
          defaultMessage="Invalid Address"
        />
      );
      break;
    case 'Invalid Amount':
      return (
        <FormattedMessage
          id="Alert.InvalidAmount"
          defaultMessage="Invalid Amount"
        />
      );
      break;
    case 'Invalid':
      return <FormattedMessage id="Alert.Invalid" defaultMessage="Invalid" />;
      break;
    case 'No Addresses':
      return (
        <FormattedMessage
          id="Alert.NoAddresses"
          defaultMessage="No Addresses"
        />
      );
      break;
    case 'Insufficient funds':
      return (
        <FormattedMessage
          id="Alert.InsufficientFunds"
          defaultMessage="Insufficient Funds"
        />
      );
      break;
    case 'Empty Queue!':
      return (
        <FormattedMessage id="Alert.QueueEmpty" defaultMessage="Queue Empty" />
      );
      break;
    case 'Invalid Transaction Fee':
      return (
        <FormattedMessage
          id="Alert.InvalidTransactionFee"
          defaultMessage="Invalid Transaction Fee"
        />
      );
      break;
    case 'No ammount set':
      return (
        <FormattedMessage
          id="Alert.NoAmmountSet"
          defaultMessage="No Ammount Set"
        />
      );
      break;
    case 'Please Fill Out Field':
      return (
        <FormattedMessage
          id="Alert.PleaseFillOutField"
          defaultMessage="Please Fill Out Field"
        />
      );
      break;
    case 'Incorrect Passsword':
      return (
        <FormattedMessage
          id="Alert.IncorrectPasssword"
          defaultMessage="Incorrect Passsword"
        />
      );
      break;
    case 'Accounts are the same':
      return (
        <FormattedMessage
          id="Alert.AccountsAreTheSame"
          defaultMessage="Accounts are the same"
        />
      );
      break;
    case 'No second account chosen':
      return (
        <FormattedMessage
          id="Alert.NoSecondAccountChosen"
          defaultMessage="No second account chosen"
        />
      );
      break;
    case 'Please wait for daemon':
      return (
        <FormattedMessage
          id="Alert.DaemonLoadingWait"
          defaultMessage="Loading Daemon, Please wait..."
        />
      );
      break;

    default:
      return modaltype;
      break;
  }
}

const ErrorModal = ({ openErrorModal, CloseErrorModal, modaltype }) => (
  <Modal
    showCloseIcon={false}
    center={true}
    open={openErrorModal}
    onClose={CloseErrorModal}
    classNames={{ modal: 'custom-Error-Modal' }}
    onEntered={() => {
      console.log('yp');
      setTimeout(() => {
        CloseErrorModal();
      }, 3000);
    }}
  >
    <h2>{modalContent(modaltype)}</h2>
  </Modal>
);

export default ErrorModal;
