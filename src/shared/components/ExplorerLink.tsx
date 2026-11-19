import { ReactNode } from 'react';
import styled from '@emotion/styled';

import ExternalLink from 'components/ExternalLink';
import Icon from 'components/Icon';
import { useCoreInfo } from 'lib/coreInfo';
import linkIcon from 'icons/link.svg';

__ = __context('Explorer');

export const explorerBaseUrl = 'https://explorer.nexus.io';

/** Explorer page of a transaction id, register address or name */
export const explorerUrl = (id: string) =>
  `${explorerBaseUrl}/scan/${encodeURIComponent(id)}`;

/** The public explorer only knows mainnet */
export function useExplorerAvailable() {
  const coreInfo = useCoreInfo();
  return !!coreInfo && !coreInfo.testnet && !coreInfo.private;
}

const LinkWrapper = styled(ExternalLink)({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.45em',
  whiteSpace: 'nowrap',
});

export default function ExplorerLink({
  id,
  children,
  className,
}: {
  id?: string;
  children?: ReactNode;
  className?: string;
}) {
  const available = useExplorerAvailable();
  if (!available || !id) return null;
  return (
    <LinkWrapper href={explorerUrl(id)} className={className}>
      <Icon icon={linkIcon} style={{ fontSize: '0.85em' }} />
      <span>{children ?? __('View on explorer')}</span>
    </LinkWrapper>
  );
}
