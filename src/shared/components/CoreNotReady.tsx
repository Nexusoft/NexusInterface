import { useAtomValue } from 'jotai';
import styled from '@emotion/styled';

import Button from 'components/Button';
import Spinner from 'components/Spinner';
import { coreConnectedAtom, coreStuckAtom, useCoreInfo } from 'lib/coreInfo';
import { settingAtoms } from 'lib/settings';
import { restartStuckCore } from 'lib/coreHealth';

__ = __context('CoreNotReady');

export type NotReadyReason =
  'disconnected' | 'syncing' | 'stuck' | 'registering';

/** Why an account cannot be created or opened right now, null when it can */
export function useCoreNotReady({
  allowRegistering = false,
}: { allowRegistering?: boolean } = {}): NotReadyReason | null {
  const connected = useAtomValue(coreConnectedAtom);
  const info = useCoreInfo();
  const stuck = useAtomValue(coreStuckAtom);
  const pending = useAtomValue(settingAtoms.pendingRegistration);
  if (!connected) return 'disconnected';
  if (info?.syncing) return 'syncing';
  if (stuck) return 'stuck';
  if (pending && !allowRegistering) return 'registering';
  return null;
}

const Box = styled.div(({ theme }) => ({
  textAlign: 'center',
  padding: '8px 0 4px',
  color: theme.foreground,
  '& .title': { fontSize: 18, marginBottom: 12 },
  '& .detail': { opacity: 0.8, fontSize: 14, marginTop: 8 },
  '& .note': {
    opacity: 0.65,
    fontStyle: 'italic',
    fontSize: 13,
    marginTop: 18,
  },
}));

const Bar = styled.div(({ theme }) => ({
  height: 6,
  borderRadius: 3,
  background: theme.mixer(0.15),
  overflow: 'hidden',
  margin: '0 auto',
  maxWidth: 360,
  '& > div': {
    height: '100%',
    background: theme.primary,
    transition: 'width 1s ease-out',
  },
}));

const fmt = (n: number) => n.toLocaleString();

export default function CoreNotReady({
  reason,
  action,
}: {
  reason: NotReadyReason;
  action: 'create' | 'login';
}) {
  const info = useCoreInfo();
  const stuck = useAtomValue(coreStuckAtom);
  const pending = useAtomValue(settingAtoms.pendingRegistration);
  const manualDaemon = useAtomValue(settingAtoms.manualDaemon);
  const syncing = info?.syncing || null;

  return (
    <Box>
      {reason === 'disconnected' && (
        <div className="title">
          <Spinner className="mr0_4" />
          {__('Waiting for Nexus Core to connect...')}
        </div>
      )}

      {reason === 'syncing' && syncing && (
        <>
          <div className="title">
            <Spinner className="mr0_4" />
            {__('Nexus Core is synchronizing: %{progress} %', {
              progress: Math.floor(syncing.progress || 0),
            })}
          </div>
          <Bar>
            <div
              style={{ width: `${Math.min(100, syncing.progress || 0)}%` }}
            />
          </Bar>
          <div className="detail">
            {__('Block %{blocks} of %{network}', {
              blocks: fmt(info?.blocks || 0),
              network: fmt(syncing.networkBlock || 0),
            })}
            {syncing.timeRemaining
              ? ` - ${__('about %{time} left', { time: syncing.timeRemaining })}`
              : ''}
          </div>
        </>
      )}

      {reason === 'stuck' && stuck && (
        <>
          <div className="title">
            {__(
              'Nexus Core stopped at block %{blocks} while the network is at %{network}.',
              { blocks: fmt(stuck.blocks), network: fmt(stuck.network) }
            )}
          </div>
          {manualDaemon ? (
            <div className="detail">
              {__('Restart Nexus Core on the computer it runs on.')}
            </div>
          ) : (
            <Button skin="primary" onClick={() => restartStuckCore()}>
              {__('Restart Nexus Core')}
            </Button>
          )}
        </>
      )}

      {reason === 'registering' && (
        <div className="title">
          <Spinner className="mr0_4" />
          {__('User %{username} is still being created on the blockchain.', {
            username: pending?.username || '',
          })}
        </div>
      )}

      {reason !== 'registering' && (
        <div className="note">
          {action === 'create'
            ? __(
                'Creating a user needs a fully synchronized Nexus Core, otherwise it may never be confirmed. The form opens here by itself when the core is ready.'
              )
            : __(
                'Logging in needs a fully synchronized Nexus Core, otherwise your balances and transactions are not up to date. The form opens here by itself when the core is ready.'
              )}
        </div>
      )}
    </Box>
  );
}
