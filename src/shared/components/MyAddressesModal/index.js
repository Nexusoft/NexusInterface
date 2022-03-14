// External
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import ControlledModal from 'components/ControlledModal';
import TextField from 'components/TextField';
import Icon from 'components/Icon';
import Button from 'components/Button';
import searchIcon from 'icons/search.svg';
import plusIcon from 'icons/plus.svg';

import Account from './Account';
import NewAddressForm from './NewAddressForm';
import Tooltip from 'components/Tooltip';
import { showNotification } from 'lib/ui';
import { loadAccounts, updateAccountBalances } from 'lib/user';
import rpc from 'lib/rpc';

__ = __context('MyAddresses');

const MyAddressesModalComponent = styled(ControlledModal)({
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
  marginBottom: '1em',
});

async function checkwallet() {
  try {
    await rpc('checkwallet', []);
  } catch (err) {
    console.error(err);
    showNotification(__('Check wallet failed'), 'error');
    return;
  }
  showNotification(__('Check wallet pass'), 'success');
}

export default function MyAddressesModal() {
  const myAccounts = useSelector((state) => state.myAccounts);
  const locale = useSelector((state) => state.settings.locale);
  const blockCount = useSelector((state) => state.core.info.blocks);

  const [searchQuery, setSearchQuery] = useState('');
  const [creatingAddress, setCreatingAddress] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    updateAccountBalances();
  }, [blockCount]);

  const allAccounts = myAccounts || [];
  const filteredAccounts = allAccounts.filter((acc) => {
    const accName = acc.account || __('My Account');
    const searchedName = accName.toLowerCase();
    const query = searchQuery.toLowerCase();
    return searchedName.indexOf(query) >= 0;
  });

  return (
    <MyAddressesModalComponent>
      <ControlledModal.Header>My Addresses</ControlledModal.Header>
      <ControlledModal.Body>
        <Search>
          <TextField
            left={<Icon icon={searchIcon} className="mr0_4" />}
            placeholder="Search account"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            style={{ width: 300 }}
          />
          <Tooltip.Trigger tooltip={__("Check wallet's integrity")}>
            <Button fitHeight onClick={checkwallet}>
              {__('Check wallet')}
            </Button>
          </Tooltip.Trigger>
        </Search>
        {filteredAccounts.map((acc) => (
          <Account key={acc.account} account={acc} searchQuery={searchQuery} />
        ))}

        {creatingAddress ? (
          <NewAddressForm
            finish={() => {
              setCreatingAddress(false);
            }}
          />
        ) : (
          <Buttons>
            <Button
              onClick={() => {
                setCreatingAddress(true);
              }}
            >
              <Icon icon={plusIcon} className="mr0_4" />
              {__('Create new address')}
            </Button>
          </Buttons>
        )}
      </ControlledModal.Body>
    </MyAddressesModalComponent>
  );
}
