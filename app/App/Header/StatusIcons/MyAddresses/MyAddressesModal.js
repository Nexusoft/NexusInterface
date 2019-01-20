// External
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import TextField from 'components/TextField';
import Text, { translate } from 'components/Text';
import Icon from 'components/Icon';
import Button from 'components/Button';
import searchIcon from 'images/search.sprite.svg';
import plusIcon from 'images/plus.sprite.svg';
import Account from './Account';
import NewAddressForm from './NewAddressForm';

const MyAddressesModalComponent = styled(Modal)({
  // set a fixed height so that the modal won't jump when the search query changes
  height: '80%',
});

const Search = styled.div({
  marginBottom: '1em',
});

const Buttons = styled.div({
  marginTop: '2em',
});

@connect(state => ({
  myAccounts: state.addressbook.myAccounts,
  locale: state.settings.locale,
}))
export default class MyAddressesModal extends React.Component {
  state = {
    searchQuery: '',
    creatingAddress: false,
  };

  handleChange = e => {
    this.setState({
      searchQuery: e.target.value,
    });
  };

  filteredAccounts = () => {
    const allAccounts = this.props.myAccounts || [];
    return allAccounts.filter(acc => {
      const accName = acc.account || translate('AddressBook.MyAccount', locale);
      const searchedName = accName.toLowerCase();
      const query = this.state.searchQuery.toLowerCase();
      return searchedName.indexOf(query) >= 0;
    });
  };

  startCreating = () => {
    this.setState({
      creatingAddress: true,
    });
  };

  endCreating = () => {
    this.setState({
      creatingAddress: false,
    });
  };

  render() {
    return (
      <MyAddressesModalComponent>
        <Modal.Header>My Addresses</Modal.Header>
        <Modal.Body>
          <Search>
            <TextField
              left={<Icon icon={searchIcon} spaceRight />}
              placeholder="Search account"
              value={this.state.searchQuery}
              onChange={this.handleChange}
              style={{ width: 300 }}
            />
          </Search>
          {this.filteredAccounts().map(acc => (
            <Account
              key={acc.account}
              account={acc}
              searchQuery={this.state.searchQuery}
            />
          ))}

          {this.state.creatingAddress ? (
            <NewAddressForm finish={this.endCreating} />
          ) : (
            <Buttons>
              <Button onClick={this.startCreating}>
                <Icon icon={plusIcon} spaceRight />
                <Text id="AddressBook.CreateAddress" />
              </Button>
            </Buttons>
          )}
        </Modal.Body>
      </MyAddressesModalComponent>
    );
  }
}
