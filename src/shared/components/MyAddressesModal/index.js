// External
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import Modal from 'components/Modal';
import TextField from 'components/TextField';
import Icon from 'components/Icon';
import Button from 'components/Button';
import searchIcon from 'images/search.sprite.svg';
import plusIcon from 'images/plus.sprite.svg';

import Account from './Account';
import NewAddressForm from './NewAddressForm';
import Tooltip from 'components/Tooltip';
import { showNotification } from 'actions/overlays';
import rpc from 'lib/rpc';

const MyAddressesModalComponent = styled(Modal)({
  // set a fixed height so that the modal won't jump when the search query changes
  height: '80%',
});

const Search = styled.div({
  marginBottom: '1em',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'stretch',
});

const Buttons = styled.div({
  marginTop: '2em',
});

/**
 * Handles the My Address from header
 *
 * @class MyAddressesModal
 * @extends {React.Component}
 */
@connect(
  state => ({
    myAccounts: state.myAccounts,
    locale: state.settings.locale,
  }),
  { showNotification }
)
class MyAddressesModal extends React.Component {
  state = {
    searchQuery: '',
    creatingAddress: false,
  };

  /**
   * Handle search changes
   *
   * @memberof MyAddressesModal
   */
  handleChange = e => {
    this.setState({
      searchQuery: e.target.value,
    });
  };

  checkwallet = async () => {
    try {
      await rpc('checkwallet', []);
    } catch (err) {
      console.log(err);
      this.props.showNotification(_('Check wallet failed'), 'error');
      return;
    }
    this.props.showNotification(_('Check wallet pass'), 'success');
  };

  /**
   * Filter the Accounts
   *
   * @memberof MyAddressesModal
   */
  filteredAccounts = () => {
    const allAccounts = this.props.myAccounts || [];
    return allAccounts.filter(acc => {
      const accName = acc.account || _('My Account');
      const searchedName = accName.toLowerCase();
      const query = this.state.searchQuery.toLowerCase();
      return searchedName.indexOf(query) >= 0;
    });
  };

  /**
   * Start Creating
   *
   * @memberof MyAddressesModal
   */
  startCreating = () => {
    this.setState({
      creatingAddress: true,
    });
  };

  /**
   * End Creating
   *
   * @memberof MyAddressesModal
   */
  endCreating = () => {
    this.setState({
      creatingAddress: false,
    });
  };

  /**
   * React Render
   *
   * @returns
   * @memberof MyAddressesModal
   */
  render() {
    return (
      <MyAddressesModalComponent>
        <Modal.Header>My Addresses</Modal.Header>
        <Modal.Body>
          <Search>
            <TextField
              left={<Icon icon={searchIcon} className="space-right" />}
              placeholder="Search account"
              value={this.state.searchQuery}
              onChange={this.handleChange}
              style={{ width: 300 }}
            />
            <Tooltip.Trigger tooltip={_("Check wallet's integerty")}>
              <Button fitHeight onClick={this.checkwallet}>
                {_('Check wallet')}
              </Button>
            </Tooltip.Trigger>
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
                <Icon icon={plusIcon} className="space-right" />
                {_('Create new address')}
              </Button>
            </Buttons>
          )}
        </Modal.Body>
      </MyAddressesModalComponent>
    );
  }
}

export default MyAddressesModal;
