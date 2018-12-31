// External
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';

// Internal
import UIController from 'components/UIController';
import Tooltip from 'components/Tooltip';
import Modal from 'components/Modal';

function addressBookToQueue(props, closeModal) {
  let filteredAddress = props.addressbook.filter(e => {
    return e.name.toLowerCase().indexOf(props.Search.toLowerCase()) !== -1;
  });
  return filteredAddress.map((e, i) => (
    <tr key={i}>
      <td key={e.name + i}> {e.name}</td>
      {e.notMine.map((ele, i) => (
        <Tooltip.Trigger
          position="right"
          tooltip="Select recipient address"
          key={ele.address}
        >
          <td
            onClick={() => {
              closeModal();
              props.updateAddress(ele.address);
            }}
          >
            {ele.address}
          </td>
        </Tooltip.Trigger>
      ))}
    </tr>
  ));
}

export default class LookupAddressModal extends Component {
  render() {
    return (
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
                            value={this.props.Search}
                            onChange={e =>
                              this.props.SearchName(e.target.value)
                            }
                            required
                          />
                        )}
                      </FormattedMessage>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {this.props.addressbook.length == 0 ? (
                    <h1 style={{ alignSelf: 'center' }}>
                      <FormattedMessage
                        id="AddressBook.NoContacts"
                        defaultMessage="No Contacts"
                      />
                    </h1>
                  ) : (
                    addressBookToQueue(this.props, closeModal)
                  )}
                </tbody>
              </table>
            </Modal.Body>
          </>
        )}
      </Modal>
    );
  }
}
