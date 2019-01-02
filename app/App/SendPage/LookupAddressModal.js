// External
import React, { Component } from 'react';
import Text from 'components/Text';

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
                      <Text id="sendReceive.Name" />
                    </th>
                    <th className="long-column">
                      <Text id="sendReceive.Address" />
                    </th>
                    <th className="short-column">
                      <Text id="sendReceive.Lookup">
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
                      </Text>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {this.props.addressbook.length == 0 ? (
                    <h1 style={{ alignSelf: 'center' }}>
                      <Text id="AddressBook.NoContacts" />
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
