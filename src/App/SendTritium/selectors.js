import styled from '@emotion/styled';

import TokenName from 'components/TokenName';
import Icon from 'components/Icon';
import NexusAddress from 'components/NexusAddress';
import memoize from 'utils/memoize';
import shortenAddress from 'utils/shortenAddress';
import walletIcon from 'icons/wallet.svg';
import tokenIcon from 'icons/token.svg';
import contactIcon from 'icons/address-book.svg';

__ = __context('Send');

const TokenRecipientName = styled.span({
  color: 'gray',
});

const Separator = styled.div(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.primary,
}));

export const selectAccountOptions = memoize(
  (myAccounts, myTokens) => {
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
              <Icon icon={walletIcon} className="mr0_4" />
              <span className="v-align">
                {account.name ? (
                  <span>{account.name}</span>
                ) : (
                  <span>
                    <em className="semi-dim">{__('Unnamed account')}</em>{' '}
                    <span className="dim">
                      {shortenAddress(account.address)}
                    </span>
                  </span>
                )}{' '}
                ({account.balance} {TokenName.from({ account })})
              </span>
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
              <Icon icon={tokenIcon} className="mr0_4" />
              <span className="v-align">
                {token.ticker || (
                  <span>
                    <em>{__('Unnamed token')}</em>{' '}
                    <span className="dim">{shortenAddress(token.address)}</span>
                  </span>
                )}{' '}
                ({token.balance} {TokenName.from({ token })})
              </span>
            </span>
          ),
          indent: true,
        }))
      );
    }

    return options;
  },
  (state) => [state.user.accounts, state.user.tokens]
);

export const getRecipientSuggestions = memoize(
  (addressBook, myAccounts, accountAddress) => {
    const suggestions = [];
    if (addressBook) {
      Object.values(addressBook).forEach((contact) => {
        contact.addresses?.forEach(({ address, label, isMine }) => {
          if (!isMine) {
            suggestions.push({
              name: contact.name,
              address: address,
              value: address,
              display: (
                <div>
                  <div>
                    <Icon icon={contactIcon} className="mr0_4" />
                    <span className="v-align">
                      {contact.name}
                      {label ? ' - ' + label : ''}
                    </span>
                  </div>
                  <NexusAddress
                    className="semi-dim"
                    copyable={false}
                    type="truncateMiddle"
                    address={address}
                  />
                </div>
              ),
            });
          }
        });
      });
    }
    if (myAccounts) {
      myAccounts.forEach((account) => {
        if (accountAddress && account.address === accountAddress) return;
        // if (tokenAddress && account.token !== tokenAddress) return;

        suggestions.push({
          name: account.name,
          address: account.address,
          value: account.name,
          display: (
            <div>
              <div>
                <Icon icon={walletIcon} className="mr0_4" />
                <span className="v-align">
                  {account.name ? (
                    <span>{account.name}</span>
                  ) : (
                    <em className="semi-dim">{__('Unnamed account')}</em>
                  )}{' '}
                  <TokenRecipientName>
                    (<TokenName account={account} />)
                  </TokenRecipientName>
                </span>
              </div>
              <NexusAddress
                className="semi-dim"
                copyable={false}
                type="truncateMiddle"
                address={account.address}
              />
            </div>
          ),
        });
      });
    }
    return suggestions;
  },
  (state, source) => [
    state.addressBook,
    state.user?.accounts,
    source?.account?.address,
  ]
);
