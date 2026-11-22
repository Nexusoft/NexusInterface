import styled from '@emotion/styled';
import { useState } from 'react';
import { useSelector } from 'react-redux';

import Button from 'components/Button';
import { updateSettings } from 'lib/settings';
import { restartCore } from 'lib/core';

import { fade, mix } from 'utils/color';

__ = __context('LiteModeNotice');

const Screen = styled.main(({ theme }) => ({
  position: 'fixed', inset: 0, display: 'flex', overflowY: 'auto',
  padding: '32px 20px', boxSizing: 'border-box', color: theme.foreground,
  background: `radial-gradient(ellipse at top, ${mix(theme.background, theme.primary, 0.12)}, ${theme.background} 70%)`,
}));

const Panel = styled.section(({ theme }) => ({
  width: '100%', maxWidth: 820, minWidth: 0, margin: 'auto', padding: 32,
  boxSizing: 'border-box', borderRadius: 24, background: theme.background,
  border: `1px solid ${theme.mixer(0.15)}`, boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
  '.brand': { color: theme.primary, fontSize: 11, fontWeight: 600, letterSpacing: 2 },
  h1: { margin: '14px 0 10px', fontSize: 28, fontWeight: 500, lineHeight: 1.25, letterSpacing: '-0.6px' },
  '.intro': { margin: 0, fontSize: 14, lineHeight: 1.6, color: theme.mixer(0.7) },
  '.choices': { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16, marginTop: 28 },
  '.choice': { display: 'flex', flexDirection: 'column', minWidth: 0, padding: 22, borderRadius: 16,
    border: `1px solid ${fade(theme.primary, 0.65)}`, background: `linear-gradient(135deg, ${fade(theme.primary, 0.94)}, transparent)` },
  '.mode-symbol': { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44,
    borderRadius: 12, marginBottom: 20, color: theme.primary, background: fade(theme.primary, 0.9) },
  '.mode-symbol svg': { width: 24, height: 24 },
  h2: { margin: '0 0 8px', fontSize: 21, fontWeight: 600 },
  '.description': { margin: 0, color: theme.mixer(0.7), fontSize: 13, lineHeight: 1.6 },
  ul: { flex: 1, margin: '20px 0 24px', padding: 0, listStyle: 'none', fontSize: 13, lineHeight: 1.6 },
  li: { position: 'relative', paddingLeft: 16, marginTop: 10,
    '&::before': { content: '""', position: 'absolute', left: 0, top: 8, width: 4, height: 4, borderRadius: '50%', background: theme.primary } },
  '.note': { margin: '24px 0 0', paddingTop: 20, borderTop: `1px solid ${theme.mixer(0.12)}`, color: theme.mixer(0.65), fontSize: 12, lineHeight: 1.6, textAlign: 'center' },
  '[role="status"], [role="alert"]': { fontSize: 13, lineHeight: 1.6 },
  '[role="alert"]': { color: theme.danger },
  '@media (max-width: 620px)': { padding: 22, h1: { fontSize: 24 }, '.choices': { gridTemplateColumns: '1fr' } },
}));

export default function LiteModeNotice() {
  const currentLiteMode = useSelector(state => state.settings.liteMode);
  const manualDaemon = useSelector(state => state.settings.manualDaemon);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function selectMode(liteMode) {
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      updateSettings({ liteMode });
      if (liteMode !== currentLiteMode && !manualDaemon) await restartCore();
      updateSettings({ liteModeNoticeDisabled: true });
    } catch (err) {
      updateSettings({ liteMode: currentLiteMode });
      setError(__('Unable to apply this mode. Please try again.'));
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Panel aria-labelledby="mode-title" aria-busy={saving}>
        <header>
          <div className="brand">NEXUS WALLET</div>
          <h1 id="mode-title">{__('Choose your wallet mode')}</h1>
          <p className="intro">{__('Start with the experience that works for you.')}</p>
        </header>
        <div className="choices">
          <section className="choice" aria-labelledby="lite-title">
            <div className="mode-symbol" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M13 2 4 14h7l-1 8 10-13h-7l1-7Z" /></svg>
            </div>
            <h2 id="lite-title">{__('Lite mode')}</h2>
            <p className="description">{__('A lighter way to use your wallet.')}</p>
            <ul>
              <li>{__('Faster synchronization')}</li>
              <li>{__('Lower memory and storage use')}</li>
              <li>{__('Mining and staking unavailable')}</li>
            </ul>
            <Button wide type="button" skin="filled-primary" disabled={saving} onClick={() => selectMode(true)}>
              {__('Use Lite mode')}
            </Button>
          </section>
          <section className="choice" aria-labelledby="full-title">
            <div className="mode-symbol" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" /></svg>
            </div>
            <h2 id="full-title">{__('Full mode')}</h2>
            <p className="description">{__('The complete blockchain experience.')}</p>
            <ul>
              <li>{__('Mining and staking supported')}</li>
              <li>{__('Stores the full blockchain')}</li>
              <li>{__('More resources and sync time required')}</li>
            </ul>
            <Button wide type="button" skin="primary" disabled={saving} onClick={() => selectMode(false)}>
              {__('Use Full mode')}
            </Button>
          </section>
        </div>
        {saving && <p role="status">{__('Applying wallet mode...')}</p>}
        {error && <p role="alert">{error}</p>}
        <p className="note">{__('You can change your mode anytime in Settings / Core.')}</p>
      </Panel>
    </Screen>
  );
}
