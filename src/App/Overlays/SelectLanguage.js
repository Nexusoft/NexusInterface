import { useState } from 'react';
import styled from '@emotion/styled';

import Button from 'components/Button';
import languages from 'data/languages';
import { timing } from 'styles';
import * as color from 'utils/color';
import { updateSettingsFile } from 'lib/settings/universal';

const Screen = styled.main(({ theme }) => ({
  position: 'fixed',
  inset: 0,
  overflowY: 'auto',
  display: 'flex',
  padding: 32,
  boxSizing: 'border-box',
  color: theme.foreground,
  background: `radial-gradient(ellipse at top, ${color.mix(theme.background, theme.primary, 0.12)}, ${theme.background} 70%)`,
  '@media (max-width: 600px)': { padding: 16 },
}));

const Panel = styled.section(({ theme }) => ({
  width: '100%',
  maxWidth: 880,
  minWidth: 0,
  margin: 'auto',
  padding: 32,
  boxSizing: 'border-box',
  borderRadius: 24,
  border: `1px solid ${theme.mixer(0.15)}`,
  background: theme.background,
  boxShadow: '0 24px 80px rgba(0, 0, 0, 0.18)',
  '@media (max-width: 600px)': { padding: 20, borderRadius: 18 },
}));

const Header = styled.header(({ theme }) => ({
  marginBottom: 28,
  '.brand': { color: theme.primary, fontSize: 12, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' },
  h1: { margin: '12px 0 8px', fontSize: 30, fontWeight: 500, letterSpacing: '-0.7px', lineHeight: 1.2 },
  p: { margin: 0, color: theme.mixer(0.65), fontSize: 14, lineHeight: 1.6 },
}));

const LanguageGrid = styled.fieldset(({ theme }) => ({
  border: 0,
  padding: 0,
  margin: 0,
  minWidth: 0,
  legend: { padding: 0, marginBottom: 14, fontSize: 13, fontWeight: 600, color: theme.mixer(0.8) },
  '.languages': {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 10,
    '@media (max-width: 760px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
    '@media (max-width: 440px)': { gridTemplateColumns: '1fr' },
  },
}));

const Language = styled.label(({ theme }) => ({
  position: 'relative',
  cursor: 'pointer',
  minWidth: 0,
  input: { position: 'absolute', opacity: 0, width: 1, height: 1 },
  '.language-card': {
    display: 'flex', alignItems: 'center', gap: 12,
    minHeight: 58, height: '100%', padding: '12px 14px', boxSizing: 'border-box',
    borderRadius: 12, border: `1px solid ${theme.mixer(0.16)}`,
    background: theme.mixer(0.025), fontSize: 14,
    transition: `background-color ${timing.quick}, border-color ${timing.quick}`,
  },
  '.language-name': { flex: 1, overflowWrap: 'anywhere' },
  '.selection-mark': {
    display: 'grid', placeItems: 'center', flexShrink: 0, width: 18, height: 18,
    borderRadius: '50%', border: `1px solid ${theme.mixer(0.3)}`, color: 'transparent', fontSize: 12,
  },
  '&:hover .language-card': { borderColor: theme.primary, background: color.mix(theme.background, theme.primary, 0.06) },
  'input:checked + .language-card': { borderColor: theme.primary, background: color.mix(theme.background, theme.primary, 0.12) },
  'input:checked + .language-card .selection-mark': {
    background: theme.primary, borderColor: theme.primary,
    color: color.luminosity(theme.primary) > 0.179 ? '#000000' : '#ffffff',
  },
  'input:focus-visible + .language-card': { outline: `2px solid ${theme.primary}`, outlineOffset: 3 },
}));

const Flag = styled.img({ width: 22, height: 16, objectFit: 'contain', flexShrink: 0 });

const Footer = styled.footer(({ theme }) => ({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
  marginTop: 28, paddingTop: 24, borderTop: `1px solid ${theme.mixer(0.12)}`,
  p: { margin: 0, fontSize: 12, lineHeight: 1.6, color: theme.mixer(0.65) },
  '@media (max-width: 600px)': { flexDirection: 'column', alignItems: 'stretch' },
}));

const ContinueButton = styled(Button)(({ theme }) => ({
  flexShrink: 0, minWidth: 160, minHeight: 46, borderRadius: 10, fontSize: 14, fontWeight: 600,
  '&&, &&:hover, &&:active': {
    background: theme.primary,
    color: color.luminosity(theme.primary) > 0.179 ? '#000000' : '#ffffff',
  },
  '&:hover': { filter: 'brightness(1.08)' },
  '&:focus-visible': { outline: `2px solid ${theme.primary}`, outlineOffset: 4 },
}));

export default function SelectLanguage() {
  const [selection, setSelection] = useState('en');

  const proceed = () => {
    updateSettingsFile({ locale: selection });
    location.reload();
  };

  return (
    <Screen>
      <Panel aria-labelledby="language-title">
        <Header>
          <div className="brand">Nexus Wallet</div>
          <h1 id="language-title">Welcome to Nexus</h1>
          <p>Choose your language to get started.</p>
        </Header>
        <LanguageGrid>
          <legend>Language</legend>
          <div className="languages">
            {languages.map((lang) => (
              <Language key={lang.code}>
                <input
                  type="radio"
                  name="language"
                  value={lang.code}
                  checked={lang.code === selection}
                  onChange={() => setSelection(lang.code)}
                />
                <span className="language-card">
                  <Flag src={lang.flag} alt="" />
                  <span className="language-name" lang={lang.code} dir="auto">{lang.name}</span>
                  <span className="selection-mark" aria-hidden="true">✓</span>
                </span>
              </Language>
            ))}
          </div>
        </LanguageGrid>
        <Footer>
          <p>You can change your language anytime in Settings.</p>
          <ContinueButton skin="filled-primary" onClick={proceed}>Continue <span aria-hidden="true" style={{ marginLeft: 16 }}>→</span></ContinueButton>
        </Footer>
      </Panel>
    </Screen>
  );
}
