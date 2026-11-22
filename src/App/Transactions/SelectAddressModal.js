import styled from '@emotion/styled';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import ControlledModal from 'components/ControlledModal';
import NexusAddress from 'components/NexusAddress';
import TokenName from 'components/TokenName';
import { timing } from 'styles';
import { refreshAccounts, refreshOwnedTokens } from 'lib/user';
import memoize from 'utils/memoize';

__ = __context('SelectAddress');

const SubHeading = styled.div({
  fontSize: '0.9em',
  fontWeight: 'bold',
});

const Option = styled.div(({ theme }) => ({
  margin: 0,
  padding: '12px 0',
  minWidth: 0,
  maxWidth: '100%',
  cursor: 'pointer',
  transitionProperty: 'opacity, background-color',
  transitionDuration: timing.normal,

  '&:hover': {
    opacity: 1,
    background: theme.background,
  },
}));

const PickerAddress = styled(NexusAddress)({
  minWidth: 0,
  maxWidth: '100%',
  '> div': { maxWidth: '100%', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' },
  input: { minWidth: 0 },
});

const selectKnownTokens = memoize(
  (userTokens, accounts) => {
    const tokens = [];
    for (const token of userTokens || []) {
      if (token.address && token.address !== '0' && !tokens.some((known) => known.address === token.address)) {
        tokens.push(token);
      }
    }
    for (const account of accounts || []) {
      const tokenAddress = account.token;
      if (
        tokenAddress && tokenAddress !== '0' &&
        !tokens.some((token) => token.address === tokenAddress)
      ) {
        tokens.push({
          name: account.ticker || account.token_name,
          address: tokenAddress,
        });
      }
    }
    return tokens;
  },
  (state) => [state.user.tokens, state.user.accounts]
);

const selectContacts = memoize(
  (addressBook) =>
    addressBook &&
    Object.entries(addressBook).reduce(
      (contacts, [name, { addresses }]) => [
        ...contacts,
        ...addresses.map((contact) => ({ ...contact, name })),
      ],
      []
    ),
  (state) => [state.addressBook]
);

export default function SelectAddressModal({ onSelect }) {
  const accounts = useSelector((state) => state.user.accounts);
  const tokens = useSelector(selectKnownTokens);
  const contacts = useSelector(selectContacts);
  useEffect(() => {
    refreshAccounts();
    refreshOwnedTokens();
  }, []);

  return (
    <ControlledModal maxWidth={500}>
      {(closeModal) => (
        <ControlledModal.Body>
          {!!accounts?.length && (
            <div>
              <SubHeading>{__('Accounts')}</SubHeading>
              {accounts.map((account) => (
                <Option
                  key={account.address}
                  onClick={() => {
                    onSelect?.(account.address);
                    closeModal();
                  }}
                >
                  <PickerAddress
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
            <div className="mt2">
              <SubHeading>{__('Tokens')}</SubHeading>
              {tokens.map((token) => (
                <Option
                  key={token.address}
                  onClick={() => {
                    onSelect?.(token.address);
                    closeModal();
                  }}
                >
                  <PickerAddress
                    label={token.name || <TokenName token={{ ...token, token: token.address }} />}
                    address={token.address}
                    copyable={false}
                  />
                </Option>
              ))}
            </div>
          )}
          {!!contacts?.length && (
            <div className="mt2">
              <SubHeading>{__('Contacts')}</SubHeading>
              {contacts.map((contact) => (
                <Option
                  key={contact.address}
                  onClick={() => {
                    onSelect?.(contact.address);
                    closeModal();
                  }}
                >
                  <PickerAddress
                    label={
                      contact.label
                        ? `${contact.name} - ${contact.label}`
                        : contact.isMine
                        ? __('My address for %{name}')
                        : __("%{name}'s address", {
                            name: contact.name,
                          })
                    }
                    address={contact.address}
                    copyable={false}
                  />
                </Option>
              ))}
            </div>
          )}
        </ControlledModal.Body>
      )}
    </ControlledModal>
  );
}
