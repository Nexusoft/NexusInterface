import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import styled from '@emotion/styled';
import { Link } from 'react-router';

import { modulesAtom } from 'lib/modules';
import { readModuleStorage } from 'lib/modules/storage';

__ = __context('Overview');

//a module can show a line on the Overview: it saves { overview: { count, text, at } } with NEXUS.utilities.updateStorage
//(storage.json in its folder), so the line stays while the module is closed
export interface ModuleOverview {
  name: string;
  displayName: string;
  count: number;
  text: string;
}

const refreshMs = 20000;
const maxText = 140;
const maxAgeSeconds = 7 * 86400;

const Bar = styled.div<{ floating?: boolean }>(
  ({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    color: theme.foreground,
  }),
  ({ floating }) =>
    floating
      ? {
          //bottom centre: the classic overview's stat tiles sit on the left and right
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          //fits the free centre column between the tiles
          maxWidth: 320,
        }
      : { maxWidth: 980, margin: '0 auto 16px' }
);

const Notice = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '8px 14px',
  borderRadius: 4,
  background: theme.lower(theme.background, 0.3),
  border: `1px solid ${theme.primary}`,
  color: theme.foreground,
  fontSize: 14,
  textDecoration: 'none',
  '&:hover': { background: theme.lower(theme.background, 0.1) },
  '& .count': {
    background: theme.primary,
    color: theme.primaryAccent,
    borderRadius: 10,
    padding: '0 8px',
    fontWeight: 'bold',
    fontSize: 12,
  },
  '& .name': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 },
  '& .open': { marginLeft: 'auto', color: theme.primary, whiteSpace: 'nowrap' },
}));

async function readOverviews(modules: any[]): Promise<ModuleOverview[]> {
  const out: ModuleOverview[] = [];
  for (const m of modules) {
    if (!m.enabled || m.info?.type !== 'app') continue;
    const o = (await readModuleStorage(m))?.overview;
    const count = Number(o?.count);
    const fresh = typeof o?.at === 'number' && Date.now() / 1000 - o.at < maxAgeSeconds;
    if (Number.isInteger(count) && count > 0 && typeof o?.text === 'string' && fresh) {
      out.push({ name: m.info.name, displayName: String(m.info.displayName || m.info.name), count, text: o.text.slice(0, maxText) });
    }
  }
  return out;
}

export default function ModuleNotices({ floating }: { floating?: boolean }) {
  const modules = useAtomValue(modulesAtom);
  const [items, setItems] = useState<ModuleOverview[]>([]);

  useEffect(() => {
    let live = true;
    const load = () =>
      readOverviews(modules)
        .then((list) => live && setItems(list))
        .catch(() => undefined);
    load();
    const timer = setInterval(load, refreshMs);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [modules]);

  if (!items.length) return null;
  return (
    <Bar floating={floating}>
      {items.map((i) => (
        <Notice key={i.name} to={`/Modules/${i.name}`} title={`${i.displayName}: ${i.text}`}>
          <span className="count">{i.count}</span>
          {floating ? (
            <b className="name">{i.displayName}</b>
          ) : (
            <span>
              <b>{i.displayName}</b>: {i.text}
            </span>
          )}
          <span className="open">{__('Open')}</span>
        </Notice>
      ))}
    </Bar>
  );
}
