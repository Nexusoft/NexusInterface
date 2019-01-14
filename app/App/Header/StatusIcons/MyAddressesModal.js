// External
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import TextField from 'components/TextField';
import { translate } from 'components/Text';
import Icon from 'components/Icon';
import searchIcon from 'images/search.sprite.svg';

@connect(state => ({
  myAccounts: state.addressbook.addressbook.myAccounts,
  locale: state.settings.settings.locale,
}))
export default class MyAddressesModal extends React.Component {
  state = {
    searchQuery: '',
  };

  handleChange = e => {
    this.setState({
      searchQuery: e.target.value,
    });
  };

  filteredAccounts = () =>
    this.props.myAccounts.filter(acc => {
      const accName = acc.account || translate('AddressBook.MyAccount', locale);
      const searchedName = accName.toLowerCase();
      const query = this.state.searchQuery.toLowerCase();
      return searchedName.indexOf(query) >= 0;
    });

  render() {
    return (
      <Modal>
        <Modal.Header>My Addresses</Modal.Header>
        <TextField
          style={{ width: 200 }}
          left={<Icon icon={searchIcon} spaceRight />}
          placeholder="Search account"
          value={this.state.searchQuery}
          onChange={this.handleChange}
        />
        <Modal.Body>{this.filteredAccounts().map(acc => ({}))}</Modal.Body>
      </Modal>
    );
  }
}
