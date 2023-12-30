// External
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

// Internal Global
import UT from 'lib/usageTracking';
import Button from 'components/Button';
import { openModal } from 'lib/ui';
import { loadOwnedTokens, loadAccounts } from 'lib/user';
import Icon from 'components/Icon';
import memoize from 'utils/memoize';

// Icons
import plusIcon from 'icons/plus.svg';
import searchIcon from 'icons/search.svg';

// Internal Local
import NewTokenModal from './NewTokenModal';
import Token from './Token';
import SearchTokenModal from './SearchTokenModal';
import TabContentWrapper from '../TabContentWrapper';

__ = __context('User.Tokens');

const selectAccountTokens = memoize((accounts, ownedTokens) =>
  accounts?.reduce((tokens, account) => {
    if (
      account.token !== '0' &&
      !ownedTokens.some((token) => token.address === account.token) &&
      !tokens?.some((token) => token.address === account.token)
    ) {
      tokens.push({
        ticker: account.ticker || account.token_name,
        address: account.token,
      });
    }
    return tokens;
  }, [])
);

export default function Tokens() {
  const session = useSelector((state) => state.user.session);
  const ownedTokens = useSelector((state) => state.user.tokens);
  const accountTokens = useSelector((state) =>
    selectAccountTokens(state.user.accounts, ownedTokens)
  );
  useEffect(() => {
    UT.SendScreen('Tokens');
    loadOwnedTokens();
    loadAccounts();
  }, [session]);

  return (
    <TabContentWrapper>
      <div className="flex space-between">
        <Button
          onClick={() => {
            openModal(NewTokenModal);
          }}
        >
          <Icon icon={plusIcon} className="mr0_4" />
          {__('Create new token')}
        </Button>
        <Button
          onClick={() => {
            openModal(SearchTokenModal);
          }}
        >
          <Icon icon={searchIcon} className="mr0_4" />
          {__('Look up a token')}
        </Button>
      </div>
      <div className="mt1">
        {ownedTokens?.map((token) => (
          <Token key={token.address} token={token} mine />
        ))}
        {accountTokens?.map((token) => (
          <Token key={token.address} token={token} />
        ))}
      </div>
    </TabContentWrapper>
  );
}
