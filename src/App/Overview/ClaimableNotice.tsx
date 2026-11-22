import { useAtomValue } from 'jotai';
import styled from '@emotion/styled';

import { claimCountAtom, contractsModuleAtom, openClaimTarget } from 'lib/claimable';

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
  '& .count': {
    background: theme.primary,
    color: theme.primaryAccent,
    borderRadius: 10,
    padding: '0 8px',
    fontWeight: 'bold',
    fontSize: 12,
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
  //the module's own count of what is actually claimable, so this never promises more than the module can claim
  const count = useAtomValue(claimCountAtom);
  const module = useAtomValue(contractsModuleAtom);
  if (count <= 0) return null;
  return (
    <Banner onClick={openClaimTarget} title={__('Open to claim')}>
      <span className="count">{count}</span>
      <span className="what">
        <b>{__('You have payments to claim')}</b>
      </span>
      <span className="go">
        {module ? __('Open Nexus Contracts') : __('View')}
      </span>
    </Banner>
  );
}
