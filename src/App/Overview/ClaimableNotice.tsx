import { useAtomValue } from 'jotai';
import styled from '@emotion/styled';

import {
  pendingClaimsAtom,
  contractsModuleAtom,
  openClaimTarget,
} from 'lib/claimable';

__ = __context('Claimable');

//sits below the header, centered: visible the moment the user lands on the Overview after logging in
const Banner = styled.button(({ theme }) => ({
  position: 'absolute',
  top: 16,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 3,
  maxWidth: 'calc(100% - 32px)',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '10px 16px',
  borderRadius: 6,
  cursor: 'pointer',
  background: theme.lower(theme.background, 0.3),
  border: `1px solid ${theme.primary}`,
  color: theme.foreground,
  font: 'inherit',
  fontSize: 14,
  boxShadow: '0 2px 12px rgba(0,0,0,.4)',
  '&:hover': { background: theme.lower(theme.background, 0.1) },
  '& .dot': {
    width: 9,
    height: 9,
    borderRadius: '50%',
    background: theme.primary,
    flexShrink: 0,
  },
  '& b': { whiteSpace: 'nowrap' },
  '& .what': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  '& .go': { marginLeft: 'auto', color: theme.primary, whiteSpace: 'nowrap' },
}));

export default function ClaimableNotice() {
  const claims = useAtomValue(pendingClaimsAtom);
  const module = useAtomValue(contractsModuleAtom);
  if (!claims.length) return null;
  const amounts = claims
    .map((c) => `${Number(c.pending.toFixed(6))} ${c.ticker}`)
    .join(', ');
  return (
    <Banner onClick={openClaimTarget} title={__('Open to claim')}>
      <span className="dot" />
      <span className="what">
        <b>{__('You have payments to claim')}</b>: {amounts}
      </span>
      <span className="go">
        {module ? __('Open Nexus Contracts') : __('View')}
      </span>
    </Banner>
  );
}
