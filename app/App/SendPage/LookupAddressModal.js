// External
import React, { Component } from 'react';
import Text from 'components/Text';
import TextField from 'components/TextField';
import { connect } from 'react-redux';
// Internal Global Dependencies
import Icon from 'components/Icon';

// Internal
import UIController from 'components/UIController';
import Tooltip from 'components/Tooltip';
import Modal from 'components/Modal';

// Images
import searchIcon from 'images/search.sprite.svg';

const mapStateToProps = state => ({
  Search: state.common.Search,
});

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

class LookupAddressModal extends Component {
  render() {
    return (
      <Modal>
        {closeModal => (
          <>
            <Modal.Header>
              <Text id="sendReceive.Lookup" />
            </Modal.Header>
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
                    <th>
                      <Text id="sendReceive.Lookup">
                        {placeholder => (
                          <TextField
                            style={{
                              marginLeft: '1em',
                              fontSize: '.9375em',
                              width: 200,
                            }}
                            left={<Icon icon={searchIcon} spaceRight />}
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
export default connect(mapStateToProps)(LookupAddressModal);
