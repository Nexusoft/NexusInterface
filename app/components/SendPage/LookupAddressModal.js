// External
import React from 'react';
import { FormattedMessage } from 'react-intl';

// Internal
import Icon from 'components/Icon';
import Tooltip from 'components/Tooltip';
import Modal from 'components/Modal';
import addressBookIcon from 'images/address-book.sprite.svg';

function addressBookToQueue(props, closeModal) {
  let filteredAddress = props.addressbook.filter(e => {
    return e.name.toLowerCase().indexOf(props.Search.toLowerCase()) !== -1;
  });
  return filteredAddress.map((e, i) => (
    <tr key={i + e.name}>
      <td key={e.name + i}> {e.name}</td>
      {e.notMine.map((ele, i) => (
        <Tooltip.Trigger
          position="right"
          tooltip={
            <FormattedMessage
              id="sendReceive.CopyToFeild"
              defaultMessage="Copy To Field"
            />
          }
          key={ele.address + i}
        >
          <td
            onClick={() => {
              closeModal();
              props.updateAddress(ele.address);
              props.OpenModal('Copied');
              setTimeout(() => {
                if (props.open) {
                  props.CloseModal();
                }
              }, 3000);
            }}
          >
            {ele.address}
          </td>
        </Tooltip.Trigger>
      ))}
    </tr>
  ));
}

const LookupAddressModal = props => (
  <Modal>
    {closeModal => (
      <>
        <Modal.Header>Lookup Address</Modal.Header>
        <Modal.Body>
          <table id="AddressTable">
            <thead>
              <tr>
                <th className="short-column">
                  <FormattedMessage
                    id="sendReceive.Name"
                    defaultMessage="Name"
                  />
                </th>
                <th className="long-column">
                  <FormattedMessage
                    id="sendReceive.Address"
                    defaultMessage="Address"
                  />
                </th>
                <th className="short-column">
                  <FormattedMessage
                    id="sendReceive.Lookup"
                    defaultMessage="Search Address"
                  >
                    {placeholder => (
                      <input
                        className="searchBar"
                        placeholder={placeholder}
                        value={props.Search}
                        onChange={e => props.SearchName(e.target.value)}
                        required
                      />
                    )}
                  </FormattedMessage>
                </th>
              </tr>
            </thead>
            <tbody>
              {props.addressbook.length == 0 ? (
                <h1 style={{ alignSelf: 'center' }}>
                  <FormattedMessage
                    id="AddressBook.NoContacts"
                    defaultMessage="No Contacts"
                  />
                </h1>
              ) : (
                addressBookToQueue(props, closeModal)
              )}
            </tbody>
          </table>
        </Modal.Body>
      </>
    )}
  </Modal>
);

export default LookupAddressModal;
