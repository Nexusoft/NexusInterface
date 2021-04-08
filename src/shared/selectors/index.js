import { legacyMode } from 'consts/misc';
import memoize from 'utils/memoize';

export const isCoreConnected = legacyMode
  ? ({ core: { info } }) =>
      !!(info && (info.connections || info.connections === 0))
  : ({ core: { systemInfo } }) => !!systemInfo;

export const isStaking = legacyMode
  ? ({ core: { info } }) => !!info && info.staking === 'Started'
  : ({ user: { stakeInfo } }) => !!(stakeInfo && stakeInfo.staking);

export const isSynchronized = legacyMode
  ? ({ core: { info } }) => !!info && info.synccomplete === 100
  : ({ core: { systemInfo } }) => !!systemInfo && !systemInfo.synchronizing;

export const isLoggedIn = legacyMode
  ? () => false
  : ({ user }) => !!(user && user.status);

export const selectTokenBalances = legacyMode
  ? () => undefined
  : memoize(
      (accounts) => {
        const tokenBalances = {};
        accounts?.forEach((acc) => {
          if (acc.token && acc.token !== '0') {
            if (!tokenBalances[acc.token]) {
              tokenBalances[acc.token] = {
                name: acc.token_name,
                address: acc.token,
                balance: 0,
                pending: 0,
                unconfirmed: 0,
              };
            }
            const token = tokenBalances[acc.token];
            token.balance += acc.balance;
            token.pending += acc.pending;
            token.unconfirmed += acc.unconfirmed;
          }
        });
        return Object.values(tokenBalances);
      },
      ({ user: { accounts } }) => [accounts]
    );
