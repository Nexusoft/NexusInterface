import matchesRecord from '../search';
// External
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

// Internal Global
import UT from 'lib/usageTracking';
import Button from 'components/Button';
import { openModal } from 'lib/ui';
import { refreshOwnedTokens, refreshAccounts } from 'lib/user';
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
      !ownedTokens?.some((token) => token.address === account.token) &&
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

export function CreateTokenButton(props) {
  return <Button skin="primary" {...props} onClick={() => openModal(NewTokenModal)}>
    <Icon icon={plusIcon} className="mr0_4" />
    {__('Create new token')}
  </Button>;
}

export function LookupTokenButton(props) {
  return <Button skin="primary" {...props} onClick={() => openModal(SearchTokenModal)}>
    <Icon icon={searchIcon} className="mr0_4" />
    {__('Look up a token')}
  </Button>;
}

export default function Tokens({ search = '', hideCreate = false, hideLookup = false }) {
  const session = useSelector((state) => state.user.session);
  const ownedTokens = useSelector((state) => state.user.tokens);
  const accountTokens = useSelector((state) =>
    selectAccountTokens(state.user.accounts, ownedTokens)
  );
  useEffect(() => {
    UT.SendScreen('Tokens');
    refreshOwnedTokens();
    refreshAccounts();
  }, [session]);

  const visibleOwned = ownedTokens?.filter((token) => matchesRecord(token, search));
  const visibleHeld = accountTokens?.filter((token) => matchesRecord(token, search));

  return (
    <TabContentWrapper>
      {(!hideCreate || !hideLookup) && <div className="flex space-between">
        {!hideLookup && <LookupTokenButton />}
        {!hideCreate && <CreateTokenButton />}
      </div>}
      <div className="mt1">
        {!visibleOwned?.length && !visibleHeld?.length && <div className="registry-empty">{!ownedTokens || !accountTokens ? __('Records unavailable or loading...') : search.trim() ? __('No matching tokens') : __('No tokens yet. Create a token or look one up to explore its details.')}</div>}
        {visibleOwned?.map((token) => (
          <Token key={token.address} token={token} mine />
        ))}
        {visibleHeld?.map((token) => (
          <Token key={token.address} token={token} />
        ))}
      </div>
    </TabContentWrapper>
  );
}
