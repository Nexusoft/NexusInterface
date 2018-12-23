// External
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Modal from 'react-responsive-modal';

// Internal
import Icon from 'components/common/Icon';
import addressBookIcon from 'images/address-book.sprite.svg';

function addressBookToQueue(props) {
  let filteredAddress = props.addressbook.filter(e => {
    return e.name.toLowerCase().indexOf(props.Search.toLowerCase()) !== -1;
  });
  return filteredAddress.map((e, i) => (
    <tr key={i + e.name}>
      <td className="tdn" key={e.name + i}>
        {' '}
        {e.name}
      </td>
      {e.notMine.map((ele, i) => (
        <td
          onClick={() => {
            props.CloseModal4();
            props.updateAddress(ele.address);
            props.OpenModal('Copied');
            setTimeout(() => {
              if (props.open) {
                props.CloseModal();
              }
            }, 3000);
          }}
          className="dt"
          key={ele.address + i}
        >
          {ele.address}
          <span
            key={ele.address + i}
            className="tooltip right"
            style={{ whiteSpace: 'nowrap' }}
          >
            {' '}
            <FormattedMessage
              id="sendReceive.CopyToFeild"
              defaultMessage="Copy To Field"
            />
          </span>
        </td>
      ))}
    </tr>
  ));
}

const AddressModal = props => (
  <Modal
    center
    classNames={{ modal: 'custom-modal3' }}
    showCloseIcon={true}
    open={props.openFourthModal}
    onClose={e => {
      e.preventDefault();
      props.CloseModal4();
    }}
  >
    <div className="Addresstable-wraper">
      {' '}
      <h2 className="addressModalHeader">
        <FormattedMessage
          id="sendReceive.Lookup"
          defaultMessage="Lookup Address"
        />{' '}
        <Icon icon={addressBookIcon} className="hdr-img" />
      </h2>
      <table id="AddressTable">
        <thead className="AddressThead">
          <tr>
            <th className="short-column">
              <FormattedMessage id="sendReceive.Name" defaultMessage="Name" />
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
            addressBookToQueue(props)
          )}
        </tbody>
      </table>
    </div>
  </Modal>
);

export default AddressModal;
