import { useEffect, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import { useLocation } from 'react-router';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

import Button from 'components/Button';
import Spinner from 'components/Spinner';
import { blocksAtom, coreConnectedAtom, coreStuckAtom } from 'lib/coreInfo';
import { settingAtoms } from 'lib/settings';
import { restartStuckCore } from 'lib/coreHealth';
import { stopWaitingForRegistration } from 'lib/registration';
import { navigate } from 'lib/wallet';

__ = __context('NewUser');

//Console, core output and settings stay usable while the account is created
const freePaths = ['/Settings', '/Terminal'];
const shownBlocks = 3;
const stopAfterMinutes = 15;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(40px) scale(.8); }
  to { opacity: 1; transform: none; }
`;
const pulse = keyframes`
  0%, 100% { opacity: .35; box-shadow: 0 0 0 0 transparent; }
  50% { opacity: 1; box-shadow: 0 0 18px 2px currentColor; }
`;
const flow = keyframes`
  from { background-position: 0 0; }
  to { background-position: 24px 0; }
`;

const Shade = styled.div({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  //the bottom navigation stays clickable
  bottom: 75,
  zIndex: 5,
  background: 'rgba(0,0,0,.45)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  paddingTop: 70,
});

const Card = styled.div(({ theme }) => ({
  width: 520,
  maxWidth: 'calc(100% - 32px)',
  padding: '22px 26px 18px',
  borderRadius: 6,
  background: theme.lower(theme.background, 0.35),
  border: `1px solid ${theme.mixer(0.2)}`,
  boxShadow: '0 6px 30px rgba(0,0,0,.6)',
  color: theme.foreground,
  textAlign: 'center',
  '& h2': { margin: '0 0 4px', fontSize: 21, fontWeight: 'normal' },
  '& .user': { color: theme.primary, fontWeight: 'bold' },
  '& .hint': { opacity: 0.7, fontSize: 13, marginTop: 6 },
}));

const Chain = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '22px 0 16px',
  height: 64,
});

const Block = styled.div<{ next?: boolean }>(({ theme, next }) => ({
  width: 78,
  height: 54,
  borderRadius: 5,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  fontSize: 11,
  lineHeight: 1.4,
  border: next
    ? `2px dashed ${theme.primary}`
    : `1px solid ${theme.mixer(0.35)}`,
  background: next ? 'transparent' : theme.mixer(0.08),
  //the glow takes this colour, so it follows the theme
  color: next ? theme.primary : theme.foreground,
  animation: next
    ? `${pulse} 1.8s ease-in-out infinite`
    : `${slideIn} .6s ease-out`,
  '& b': { fontSize: 12 },
}));

const Link = styled.div(({ theme }) => ({
  width: 26,
  height: 2,
  backgroundImage: `linear-gradient(90deg, ${theme.primary} 50%, transparent 50%)`,
  backgroundSize: '8px 2px',
  animation: `${flow} 1s linear infinite`,
  opacity: 0.8,
}));

const Steps = styled.ol(({ theme }) => ({
  listStyle: 'none',
  padding: 0,
  margin: '0 auto',
  textAlign: 'left',
  display: 'inline-block',
  fontSize: 14,
  '& li': { margin: '6px 0', display: 'flex', alignItems: 'center', gap: 10 },
  '& .mark': { width: 18, textAlign: 'center', color: theme.primary },
  '& .todo': { opacity: 0.5 },
}));

const Warn = styled.div(({ theme }) => ({
  marginTop: 14,
  padding: '10px 12px',
  borderRadius: 4,
  border: `1px solid ${theme.danger}`,
  background: 'rgba(143,36,14,.18)',
  fontSize: 13,
  '& button': { marginTop: 8 },
}));

const Links = styled.div({
  marginTop: 16,
  display: 'flex',
  justifyContent: 'center',
  gap: 18,
  flexWrap: 'wrap',
});

const Strip = styled.div(({ theme }) => ({
  position: 'fixed',
  bottom: 84,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 5,
  padding: '6px 14px',
  borderRadius: 4,
  background: theme.lower(theme.background, 0.3),
  border: `1px solid ${theme.primary}`,
  color: theme.foreground,
  fontSize: 13,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  whiteSpace: 'nowrap',
}));

const fmt = (n: number) => n.toLocaleString();

function elapsedText(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  return m ? __('%{m} min %{s} s', { m, s: s % 60 }) : __('%{s} s', { s });
}

/** Shown while a new user waits for its first block, over everything but the bottom bar */
export default function RegistrationScreen() {
  const pending = useAtomValue(settingAtoms.pendingRegistration);
  const blocks = useAtomValue(blocksAtom);
  const connected = useAtomValue(coreConnectedAtom);
  const stuck = useAtomValue(coreStuckAtom);
  const manualDaemon = useAtomValue(settingAtoms.manualDaemon);
  const { pathname } = useLocation();
  const [now, setNow] = useState(Date.now());
  const recent = useRef<number[]>([]);
  const lastBlockAt = useRef<number | null>(null);

  useEffect(() => {
    if (!pending) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [pending]);

  if (blocks && recent.current[recent.current.length - 1] !== blocks) {
    if (recent.current.length) lastBlockAt.current = Date.now();
    recent.current = [...recent.current, blocks].slice(-shownBlocks);
  }

  if (!pending) return null;

  const waited = now - pending.startedAt;
  const free = freePaths.some((p) => pathname.startsWith(p));
  if (free) {
    return (
      <Strip>
        <Spinner />
        <span>
          {__('Creating user %{username}...', { username: pending.username })}
        </span>
        <Button skin="hyperlink" onClick={() => navigate('/')}>
          {__('Show')}
        </Button>
      </Strip>
    );
  }

  //fill the row with the blocks before the current one until new ones come in
  const shown = recent.current.length
    ? Array.from(
        { length: shownBlocks },
        (_, i) =>
          recent.current[recent.current.length - 1] - (shownBlocks - 1 - i)
      )
    : [];

  return (
    <Shade>
      <Card>
        <h2>{__('Creating your user')}</h2>
        <div className="user">{pending.username}</div>

        <Chain>
          {shown.map((b) => (
            <span key={b} style={{ display: 'flex', alignItems: 'center' }}>
              <Block>
                <span>{__('Block')}</span>
                <b>{fmt(b)}</b>
              </Block>
              <Link />
            </span>
          ))}
          <Block next>
            <span>{__('next block')}</span>
            <b>{__('your user')}</b>
          </Block>
        </Chain>

        <Steps>
          <li>
            <span className="mark">&#10003;</span>
            {__('Sent to the Nexus network')}
          </li>
          <li>
            <span className="mark">
              <Spinner />
            </span>
            {__('Waiting to be written into the next block')}
          </li>
          <li className="todo">
            <span className="mark">&#9675;</span>
            {__('Ready to log in')}
          </li>
        </Steps>

        <div className="hint">
          {__('Waiting for %{time}', { time: elapsedText(waited) })}
          {lastBlockAt.current
            ? ` - ${__('last block %{time} ago', {
                time: elapsedText(now - lastBlockAt.current),
              })}`
            : ''}
        </div>
        <div className="hint">
          {__(
            'A new block comes about every 50 seconds, so this usually takes 1 to 3 minutes. The login opens by itself when it is done.'
          )}
        </div>

        {!connected && (
          <Warn>{__('Waiting for Nexus Core to connect...')}</Warn>
        )}
        {connected && stuck && (
          <Warn>
            <div>
              {__(
                'Nexus Core stopped at block %{blocks} while the network is at %{network}.',
                { blocks: fmt(stuck.blocks), network: fmt(stuck.network) }
              )}
            </div>
            {manualDaemon ? (
              <div>{__('Restart Nexus Core on the computer it runs on.')}</div>
            ) : (
              <Button skin="primary" onClick={() => restartStuckCore()}>
                {__('Restart Nexus Core')}
              </Button>
            )}
          </Warn>
        )}

        <Links>
          <Button skin="hyperlink" onClick={() => navigate('/Terminal/Core')}>
            {__('Core output')}
          </Button>
          <Button
            skin="hyperlink"
            onClick={() => navigate('/Terminal/Console')}
          >
            {__('Console')}
          </Button>
          <Button skin="hyperlink" onClick={() => navigate('/Settings')}>
            {__('Settings')}
          </Button>
          {waited > stopAfterMinutes * 60000 && (
            <Button skin="hyperlink" onClick={stopWaitingForRegistration}>
              {__('Stop waiting')}
            </Button>
          )}
        </Links>
      </Card>
    </Shade>
  );
}
