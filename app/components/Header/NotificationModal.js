// External Dependencies
import React from 'react'
import Modal from 'react-responsive-modal'
import { FormattedMessage } from 'react-intl'

function modalContent(modaltype) {
  switch (modaltype) {
    case 'receive':
      return (
        <FormattedMessage
          id="Alert.Received"
          defaultMessage="Transaction Received"
        />
      )
      break
    case 'send':
      return (
        <FormattedMessage id="Alert.Sent" defaultMessage="Transaction Sent" />
      )
      break
    case 'genesis':
      return (
        <FormattedMessage
          id="Alert.Genesis"
          defaultMessage="Genesis Transaction"
        />
      )
      break
    case 'trust':
      return (
        <FormattedMessage
          id="Alert.TrustTransaction"
          defaultMessage="Trust Transaction"
        />
      )
      break
    case 'This is an address regiestered to this wallet':
      return (
        <FormattedMessage
          id="Alert.regiesteredToThis"
          defaultMessage="This is an address regiestered to this wallet"
        />
      )
      break
    case 'Invalid Address':
      return (
        <FormattedMessage
          id="Alert.InvalidAmount"
          defaultMessage="Invalid Amount"
        />
      )
      break
    case 'Invalid Amount':
      return (
        <FormattedMessage
          id="Alert.InvalidAddress"
          defaultMessage="Invalid Amount"
        />
      )
      break
    case 'Invalid':
      return <FormattedMessage id="Alert.Invalid" defaultMessage="Invalid" />
      break
    case 'Address Added':
      return (
        <FormattedMessage
          id="Alert.AddressAdded"
          defaultMessage="Address Added"
        />
      )
      break
    case 'No Addresses':
      return (
        <FormattedMessage
          id="Alert.NoAddresses"
          defaultMessage="No Addresses"
        />
      )
      break
    case 'Insufficient Funds':
      return (
        <h2>
          <FormattedMessage
            id="Alert.InsufficientFunds"
            defaultMessage="Insufficient Funds"
          />
        </h2>
      )
      break
    case 'Empty Queue!':
      return (
        <FormattedMessage id="Alert.QueueEmpty" defaultMessage="Queue Empty" />
      )
      break
    case 'Password has been changed.':
      return (
        <FormattedMessage
          id="Alert.PasswordHasBeenChanged"
          defaultMessage="Password has been changed"
        />
      )
      break
    case 'Wallet has been encrypted':
      return (
        <FormattedMessage
          id="Alert.WalletHasBeenEncrypted"
          defaultMessage="Wallet has been encrypted"
        />
      )
      break
    case 'Settings saved':
      return (
        <FormattedMessage
          id="Alert.SettingsSaved"
          defaultMessage="Settings Saved"
        />
      )
      break
    case 'Transaction Fee Set':
      return (
        <FormattedMessage
          id="Alert.TransactionFeeSet"
          defaultMessage="Transaction Fee Set"
        />
      )
      break
    case 'Wallet Locked':
      return (
        <FormattedMessage
          id="Alert.WalletLocked"
          defaultMessage="Wallet Locked"
        />
      )
      break
    case 'Wallet Backup':
      return (
        <FormattedMessage
          id="Alert.WalletBackedUp"
          defaultMessage="Wallet Backed Up"
        />
      )
      break
    case 'Invalid Transaction Fee':
      return (
        <FormattedMessage
          id="Alert.InvalidTransactionFee"
          defaultMessage="Invalid Transaction Fee"
        />
      )
      break
    case 'Copied':
      return <FormattedMessage id="Alert.Copied" defaultMessage="Copied" />
      break
    case 'Style Settings Saved':
      return (
        <FormattedMessage
          id="Alert.StyleSettingsSaved"
          defaultMessage="Style Settings Saved"
        />
      )
      break
    case 'No ammount set':
      return (
        <FormattedMessage
          id="Alert.NoAmmountSet"
          defaultMessage="No Ammount Set"
        />
      )
      break
    case 'Please Fill Out Field':
      return (
        <FormattedMessage
          id="Alert.PleaseFillOutField"
          defaultMessage="Please Fill Out Field"
        />
      )
      break
    case 'FutureDate':
      return (
        <FormattedMessage
          id="Alert.FutureDate"
          defaultMessage="Unlock until date/time must be at least an hour in the future"
        />
      )
      break
    case 'Incorrect Passsword':
      return (
        <FormattedMessage
          id="Alert.IncorrectPasssword"
          defaultMessage="Incorrect Passsword"
        />
      )
      break
    case 'Core Settings Saved':
      return (
        <FormattedMessage
          id="Alert.CoreSettingsSaved"
          defaultMessage="Core Settings Saved"
        />
      )
      break
    case 'Contacts Exported':
      return (
        <FormattedMessage
          id="Alert.ContactsExported"
          defaultMessage="Contacts Exported"
        />
      )
      break
    case 'Core Restarting':
      return (
        <FormattedMessage
          id="Alert.CoreRestarting"
          defaultMessage="Core Restarting"
        />
      )
      break
    default:
      return modaltype
      break
  }
}

const NotificationModal = ({ open, CloseModal, modaltype }) => (
  <Modal
    showCloseIcon={false}
    center={true}
    open={open}
    onClose={CloseModal}
    classNames={{ modal: 'custom-modal' }}
    onOpen={() => {
      setTimeout(() => {
        CloseModal()
      }, 3000)
    }}
  >
    <h2>{modalContent(modaltype)}</h2>
  </Modal>
)

export default NotificationModal
