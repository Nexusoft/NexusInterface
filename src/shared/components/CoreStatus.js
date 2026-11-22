import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

import { isCoreConnected } from 'selectors';

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: .4; transform: scale(.8); }
`;

const Status = styled.span({
  display: 'inline-flex', alignItems: 'center', gap: 8,
  '.core-status-dot': {
    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
    background: 'currentColor',
  },
  '&[data-state="connecting"] .core-status-dot': { color: '#f2c94c' },
  '&[data-state="failed"] .core-status-dot': { color: '#ef4444' },
  '&[data-state="connecting"] .core-status-dot, &[data-state="failed"] .core-status-dot': {
    animation: `${pulse} 1.5s ease-in-out infinite`,
  },
  '@media (prefers-reduced-motion: reduce)': {
    '.core-status-dot': { animation: 'none' },
  },
});

export default function CoreStatus() {
  const coreConnected = useSelector(isCoreConnected);
  const manualDaemon = useSelector((state) => state.settings.manualDaemon);
  const autoConnect = useSelector((state) => state.core.autoConnect);
  const connectionFailed = useSelector((state) => state.core.connectionFailed);
  if (coreConnected) return null;
  const failed = connectionFailed && autoConnect;
  const status = failed ? 'failed' : autoConnect ? 'connecting' : 'stopped';
  const message = failed
    ? __('Failed to connect to Nexus Core. Retrying...')
    : autoConnect
    ? __('Connecting to Nexus Core...')
    : manualDaemon
    ? __('Remote Core is disconnected')
    : __('Nexus Core is stopped');
  return <Status role="status" aria-live="polite" data-state={status}>
    <span className="core-status-dot" aria-hidden="true" />
    <span>{message}</span>
  </Status>;
}
