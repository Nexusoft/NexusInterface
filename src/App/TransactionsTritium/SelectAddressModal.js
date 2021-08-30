import styled from '@emotion/styled';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import Modal from 'components/Modal';
import NexusAddress from 'components/NexusAddress';
import TokenName from 'components/TokenName';
import { timing } from 'styles';
import { loadAccounts, loadOwnedTokens } from 'lib/user';

__ = __context('SelectAddress');

const SubHeading = styled.div({
  fontSize: '0.9em',
  fontWeight: 'bold',
});

const Option = styled.div(({ theme }) => ({
  opacity: 0.95,
  margin: '0 -50px',
  padding: '7px 50px',
  transition: `opacity ${timing.normal}`,

  '&:hover': {
    opacity: 1,
  },
}));

const selectKnownTokens = memoize(
  (userTokens, accounts) => {
    userTokens = userTokens || [];
    const tokens = [{ address: '0', name: 'NXS' }, ...userTokens];
    for (const account of accounts || []) {
      const tokenAddress = account.token;
      if (
        tokenAddress !== '0' &&
        !userTokens.some((token) => token.address === tokenAddress)
      ) {
        tokens.push({
          name: account.ticker || account.token_name,
          address: tokenAddress,
        });
      }
    }
    return tokens;
  },
  (state) => state.user.tokens
);

const selectContacts = memoize(
  (addressBook) =>
    addressBook &&
    Object.entries(addressBook).map(([name, { addresses }]) => ({
      name,
      addresses,
    })),
  (state) => state.addressBook
);

export default function SelectAddressModal({ onSelect }) {
  useEffect(() => {
    loadAccounts();
    loadOwnedTokens();
  }, []);

  const accounts = useSelector((state) => state.user.accounts);
  const tokens = useSelector(selectKnownTokens);
  const contacts = useSelector(selectContacts);
  return (
    <Modal>
      {(closeModal) => (
        <Modal.Body>
          {!!accounts?.length && (
            <div>
              <SubHeading>{__('Accounts')}</SubHeading>
              {accounts.map((account) => (
                <Option
                  onClick={() => {
                    onSelect?.(account.address);
                    closeModal();
                  }}
                >
                  <NexusAddress
                    label={
                      account.name || (
                        <span className="dim">{__('Unnamed account')}</span>
                      )
                    }
                    address={account.address}
                    copyable={false}
                  />
                </Option>
              ))}
            </div>
          )}
          {!!tokens?.length && (
            <div>
              <SubHeading>{__('Tokens')}</SubHeading>
              {tokens.map((token) => (
                <Option
                  onClick={() => {
                    onSelect?.(token.address);
                    closeModal();
                  }}
                >
                  <NexusAddress
                    label={<TokenName token={token} />}
                    address={token.address}
                    copyable={false}
                  />
                </Option>
              ))}
            </div>
          )}
          {!!contacts?.length && (
            <div>
              <SubHeading>{__('Contacts')}</SubHeading>
              {contacts.map((contact) => (
                <Option
                  onClick={() => {
                    onSelect?.(contact.address);
                    closeModal();
                  }}
                >
                  <NexusAddress
                    label={<TokenName contact={contact} />}
                    address={contact.address}
                    copyable={false}
                  />
                </Option>
              ))}
            </div>
          )}
        </Modal.Body>
      )}
    </Modal>
  );
}
