import styled from '@emotion/styled';

import TokenName from 'components/TokenName';
import memoize from 'utils/memoize';
import shortenAddress from 'utils/shortenAddress';

__ = __context('Send');

const TokenRecipientName = styled.span({
  color: 'gray',
});

const Separator = styled.div(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.primary,
}));

const Address = styled.span(({ theme }) => ({
  color: theme.mixer(0.75),
}));

export const getAccountOptions = memoize((myAccounts, myTokens) => {
  let options = [];

  if (myAccounts?.length) {
    options.push({
      value: 'AccountsSeparator',
      display: <Separator>{__('Accounts')}</Separator>,
      isSeparator: true,
      indent: false,
    });
    options.push(
      ...myAccounts.map((account) => ({
        value: `account:${account.address}`,
        display: (
          <span>
            {account.name || (
              <span>
                <em>{__('Unnamed account')}</em>{' '}
                <span className="dim">{shortenAddress(account.address)}</span>
              </span>
            )}{' '}
            ({account.balance} {TokenName.from({ account })})
          </span>
        ),
        indent: true,
      }))
    );
  }
  if (myTokens && myTokens.length > 0) {
    options.push({
      value: 'TokensSeparator',
      display: <Separator>{__('Tokens')}</Separator>,
      isSeparator: true,
      indent: false,
    });
    options.push(
      ...myTokens.map((token) => ({
        value: `token:${token.address}`,
        display: (
          <span>
            {token.name || (
              <span>
                <em>{__('Unnamed token')}</em>{' '}
                <span className="dim">{shortenAddress(token.address)}</span>
              </span>
            )}{' '}
            ({token.balance} {TokenName.from({ token })})
          </span>
        ),
        indent: true,
      }))
    );
  }

  return options;
});

export const getAccountBalance = memoize(
  (accountName, myAccounts, myTokens) => {
    const account =
      myAccounts && myAccounts.find((acc) => acc.name === accountName);
    const token = myTokens && myTokens((tkn) => tkn.name === accountName);
    return account && account.balance;
  }
);

export const getSendSource = memoize((sendFrom, myAccounts, myTokens) => {
  const matches = /^(account|token):(.+)/.exec(sendFrom);
  const [_, type, address] = matches || [];

  if (type === 'account') {
    const account = myAccounts?.find((acc) => acc.address === address);
    if (account) return { account };
  }

  if (type === 'token') {
    const token = myTokens?.find((tkn) => tkn.address === address);
    if (token) return { token };
  }

  return null;
});

export const getAddressNameMap = memoize((addressBook, myAccounts) => {
  const map = {};
  if (addressBook) {
    Object.values(addressBook).forEach((contact) => {
      if (contact.addresses) {
        contact.addresses.forEach(({ address, label }) => {
          map[address] = contact.name + (label ? ' - ' + label : '');
        });
      }
    });
  }
  if (myAccounts) {
    myAccounts.forEach((element) => {
      map[element.address] = element.name;
    });
  }
  return map;
});

export const getRecipientSuggestions = memoize(
  (addressBook, myAccounts, tokenAddress, accountAddress) => {
    const suggestions = [];
    if (addressBook) {
      Object.values(addressBook).forEach((contact) => {
        contact.addresses?.forEach(({ address, label, isMine }) => {
          if (!isMine) {
            suggestions.push({
              name: contact.name,
              value: address,
              display: (
                <span>
                  {contact.name}
                  {label ? ' - ' + label : ''} <Address>{address}</Address>
                </span>
              ),
            });
          }
        });
      });
    }
    if (myAccounts) {
      myAccounts.forEach((account) => {
        if (accountAddress && account.address === accountAddress) return;
        if (tokenAddress && account.token !== tokenAddress) return;

        suggestions.push({
          name: account.name || account.address,
          value: account.address,
          token: account.token,
          display: (
            <span>
              {account.name || (
                <span style={{ fontStyle: 'italic' }}>{__('Unnamed')}</span>
              )}{' '}
              <TokenRecipientName>
                (<TokenName account={account} />)
              </TokenRecipientName>{' '}
              <Address>{account.address}</Address>
            </span>
          ),
        });
      });
    }
    return suggestions;
  }
);

export const getRegisteredFieldNames = memoize((registeredFields) =>
  Object.keys(registeredFields || {})
);
