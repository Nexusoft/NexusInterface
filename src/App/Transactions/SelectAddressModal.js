import styled from '@emotion/styled';
import { useAtomValue } from 'jotai';

import ControlledModal from 'components/ControlledModal';
import NexusAddress from 'components/NexusAddress';
import TokenName from 'components/TokenName';
import { timing } from 'styles';
import { accountsQuery, tokensQuery } from 'lib/user';
import { addressBookAtom } from 'lib/addressBook';
import memoize from 'utils/memoize';

__ = __context('SelectAddress');

const SubHeading = styled.div({
  fontSize: '0.9em',
  fontWeight: 'bold',
});

const Option = styled.div(({ theme }) => ({
  // opacity: 0.9,
  margin: '0 -50px',
  padding: '1em 50px',
  transitionProperty: 'opacity, background-color',
  transitionDuration: timing.normal,

  '&:hover': {
    opacity: 1,
    background: theme.background,
  },
}));

const getKnownTokens = memoize((userTokens, accounts) => {
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
});

const getAddressList = memoize(
  (addressBook) =>
    addressBook &&
    Object.entries(addressBook).reduce(
      (list, [name, { addresses }]) => [
        ...list,
        ...addresses.map((addressInfo) => ({ ...addressInfo, name })),
      ],
      []
    )
);

export default function SelectAddressModal({ onSelect }) {
  const accounts = accountsQuery.use();
  const userTokens = tokensQuery.use();
  const knownTokens = getKnownTokens(userTokens, accounts);
  const addressBook = useAtomValue(addressBookAtom);
  const addressList = getAddressList(addressBook);

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
          {!!knownTokens?.length && (
            <div className="mt2">
              <SubHeading>{__('Tokens')}</SubHeading>
              {knownTokens.map((token) => (
                <Option
                  key={token.address}
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
          {!!addressList?.length && (
            <div className="mt2">
              <SubHeading>{__('Contacts')}</SubHeading>
              {addressList.map((addressInfo) => (
                <Option
                  key={addressInfo.address}
                  onClick={() => {
                    onSelect?.(addressInfo.address);
                    closeModal();
                  }}
                >
                  <NexusAddress
                    label={
                      addressInfo.label
                        ? `${addressInfo.name} - ${addressInfo.label}`
                        : addressInfo.isMine
                        ? __('My address for %{name}')
                        : __("%{name}'s address", {
                            name: addressInfo.name,
                          })
                    }
                    address={addressInfo.address}
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
