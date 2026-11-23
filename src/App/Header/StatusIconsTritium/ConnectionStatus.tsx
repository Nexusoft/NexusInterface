import { useState, MouseEvent } from 'react';
import styled from '@emotion/styled';
import { useAtomValue } from 'jotai';

import Tooltip from 'components/Tooltip';
import Overlay from 'components/Overlay';
import Button from 'components/Button';
import { arrowStyles } from 'components/Arrow';
import {
  connectionQualityAtom,
  Quality,
  QualityItem,
} from 'lib/connectionQuality';
import { restartStuckCore } from 'lib/coreHealth';
import { settingsAtom } from 'lib/settings';
import { formatNumber } from 'lib/intl';
import { confirm } from 'lib/dialog';
import { timing, animations } from 'styles';

import StatusIcon from './StatusIcon';

__ = __context('Header.Connection');

export const qualityColors: Record<Quality, string> = {
  good: '#3ec46d',
  fair: '#e8c547',
  poor: '#f08a24',
  bad: '#e5484d',
};
const offColor = 'rgba(128,140,155,.35)';
const barCount: Record<Quality, number> = { good: 4, fair: 3, poor: 2, bad: 1 };

function qualityLabel(quality: Quality) {
  return {
    good: __('Good'),
    fair: __('Fair'),
    poor: __('Poor'),
    bad: __('Bad'),
  }[quality];
}

/** Signal bars, 1em like the other header icons */
export function QualityBars({ quality }: { quality: Quality | null }) {
  const lit = quality ? barCount[quality] : 0;
  const color = quality ? qualityColors[quality] : offColor;
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 20 20"
      style={{ display: 'block' }}
    >
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={1 + i * 5}
          y={14 - i * 4}
          width={3.4}
          height={5 + i * 4}
          rx={0.8}
          fill={i < lit ? color : offColor}
          stroke="none"
        />
      ))}
    </svg>
  );
}

const Clickable = styled(StatusIcon)({
  cursor: 'pointer',
  padding: '2px 0',
  transition: `filter ${timing.normal}`,
  '&:hover': {
    filter: 'brightness(1.3)',
  },
});

const Popup = styled.div(({ theme }) => ({
  position: 'fixed',
  width: 380,
  background: theme.background,
  color: theme.foreground,
  fontSize: 14,
  borderRadius: 4,
  boxShadow: '0 0 12px rgba(0,0,0,.8)',
  animation: `${animations.fadeIn} ${timing.normal} ease-out`,
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: '100%',
    right: 3,
    ...arrowStyles({
      direction: 'up',
      width: 15,
      height: 8,
      color: theme.background,
    }),
  },
}));

const Head = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 16px 10px',
  borderBottom: `1px solid ${theme.mixer(0.125)}`,
  fontSize: 26,
}));

const Title = styled.div({ fontSize: 16, fontWeight: 'bold' });
const Sub = styled.div(({ theme }) => ({
  fontSize: 12,
  color: theme.mixer(0.5),
}));

const Row = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  padding: '5px 16px',
});

const Label = styled.span(({ theme }) => ({ color: theme.mixer(0.6) }));

const Dot = styled.i<{ quality: Quality }>(({ quality }) => ({
  display: 'inline-block',
  width: 8,
  height: 8,
  borderRadius: '50%',
  marginLeft: 8,
  background: qualityColors[quality],
}));

const Hint = styled.div<{ quality: Quality }>(({ quality }) => ({
  margin: '8px 16px 12px',
  padding: '8px 10px',
  borderLeft: `3px solid ${qualityColors[quality]}`,
  background: 'rgba(255,255,255,.04)',
  fontSize: 13,
  lineHeight: 1.45,
}));

const Buttons = styled.div({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 8,
  padding: '0 16px 14px',
});

function duration(ms: number) {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60)
    return __(
      '%{smart_count} second ago |||| %{smart_count} seconds ago',
      seconds
    );
  const minutes = Math.round(seconds / 60);
  if (minutes < 120)
    return __(
      '%{smart_count} minute ago |||| %{smart_count} minutes ago',
      minutes
    );
  return __(
    '%{smart_count} hour ago |||| %{smart_count} hours ago',
    Math.round(minutes / 60)
  );
}

function itemText(item: QualityItem): [string, string] {
  switch (item.id) {
    case 'response':
      return [
        __('Core answers in'),
        item.value < 1000
          ? __('%{ms} ms on average', { ms: item.value })
          : __('%{seconds} s on average', {
              seconds: formatNumber(item.value / 1000, 1),
            }),
      ];
    case 'unanswered':
      return [
        __('Unanswered requests'),
        __('%{missed} of %{total}', { missed: item.value, total: item.extra }),
      ];
    case 'behind':
      return [
        __('Behind the network'),
        __('%{smart_count} block |||| %{smart_count} blocks', item.value),
      ];
    case 'lastBlock':
      return [__('Last new block'), duration(item.value)];
    case 'peers':
      return [
        __('Peers'),
        item.extra
          ? __('%{count} connected, %{ms} ms', {
              count: item.value,
              ms: item.extra,
            })
          : __('%{count} connected', { count: item.value }),
      ];
    case 'restarts':
      return [__('Core restarts today'), String(item.value)];
  }
}

function hint(quality: Quality, connected: boolean) {
  if (!connected) return __('The wallet is not connected to Nexus Core.');
  return {
    good: __('The connection to Nexus Core is good.'),
    fair: __('Nexus Core is a bit slow at times. Everything works.'),
    poor: __(
      'Nexus Core is slow to answer or gets new blocks late. This is usually a busy PC or a slow internet connection. Staking goes on, but may find fewer blocks.'
    ),
    bad: __(
      'Nexus Core is very slow, does not answer or is stuck. Staking may not work. Check the internet connection, or restart the core.'
    ),
  }[quality];
}

export default function ConnectionStatus() {
  const status = useAtomValue(connectionQualityAtom);
  const settings = useAtomValue(settingsAtom);
  const { manualDaemon } = settings;
  //stayLoggedIn comes with the stay logged in option, absent = off
  const stayLoggedIn = !!(settings as { stayLoggedIn?: boolean }).stayLoggedIn;
  const [open, setOpen] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const quality = status?.quality || null;
  const label = !status
    ? __('Checking the connection...')
    : !status.connected
      ? __('Not connected to Nexus Core')
      : __('Connection: %{quality}', { quality: qualityLabel(status.quality) });

  //the tooltip wrapper takes the ref, so measure the icon on click
  const [popupStyle, setPopupStyle] = useState({});
  const openPopup = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPopupStyle({
      top: rect.bottom + 14,
      right: Math.max(8, window.innerWidth - rect.right - 8),
    });
    setOpen(true);
  };

  const restart = async () => {
    setOpen(false);
    const confirmed = await confirm({
      question: __('Restart Nexus Core?'),
      note: stayLoggedIn
        ? __('The wallet logs you in again when the core is back.')
        : __('You will have to log in again after the restart.'),
    });
    if (!confirmed) return;
    setRestarting(true);
    try {
      await restartStuckCore();
    } finally {
      setRestarting(false);
    }
  };

  return (
    <>
      <Tooltip.Trigger tooltip={open ? null : label}>
        <Clickable onClick={openPopup}>
          <QualityBars quality={quality} />
        </Clickable>
      </Tooltip.Trigger>
      {open && status && (
        <Overlay onBackgroundClick={() => setOpen(false)}>
          <Popup style={popupStyle}>
            <Head>
              <QualityBars quality={status.quality} />
              <div>
                <Title>{label}</Title>
                <Sub>
                  {status.syncing
                    ? __(
                        'Nexus Core is synchronizing, block checks start when it is done'
                      )
                    : __('Updated every 10 seconds')}
                </Sub>
              </div>
            </Head>
            {status.items.map((item) => {
              const [name, value] = itemText(item);
              return (
                <Row key={item.id}>
                  <Label>{name}</Label>
                  <span>
                    {value}
                    <Dot quality={item.quality} />
                  </span>
                </Row>
              );
            })}
            <Hint quality={status.quality}>
              {hint(status.quality, status.connected)}
            </Hint>
            <Buttons>
              {!manualDaemon && (
                <Button skin="default" disabled={restarting} onClick={restart}>
                  {__('Restart core')}
                </Button>
              )}
              <Button skin="primary" onClick={() => setOpen(false)}>
                {__('Close')}
              </Button>
            </Buttons>
          </Popup>
        </Overlay>
      )}
    </>
  );
}
