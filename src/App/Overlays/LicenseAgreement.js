import styled from '@emotion/styled';

import Button from 'components/Button';
import { updateSettings } from 'lib/settings';
import { mix, luminosity } from 'utils/color';

const Screen = styled.main(({ theme }) => ({
  position: 'fixed', inset: 0, overflowY: 'auto', display: 'flex',
  padding: 32, boxSizing: 'border-box', color: theme.foreground,
  background: `radial-gradient(ellipse at top, ${mix(theme.background, theme.primary, 0.12)}, ${theme.background} 70%)`,
  '@media (max-width: 600px)': { padding: 16 },
}));

const Panel = styled.section(({ theme }) => ({
  width: '100%', maxWidth: 880, minWidth: 0, margin: 'auto', padding: 32,
  boxSizing: 'border-box', borderRadius: 24,
  border: `1px solid ${theme.mixer(0.15)}`, background: theme.background,
  boxShadow: '0 24px 80px rgba(0, 0, 0, 0.18)',
  '@media (max-width: 600px)': { padding: 20, borderRadius: 18 },
}));

const Header = styled.header(({ theme }) => ({
  marginBottom: 24,
  '.brand': { color: theme.primary, fontSize: 12, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' },
  h1: { margin: '12px 0 8px', fontSize: 30, fontWeight: 500, letterSpacing: '-0.7px', lineHeight: 1.2 },
  p: { margin: 0, color: theme.mixer(0.65), fontSize: 14, lineHeight: 1.6 },
}));

const LicenseText = styled.article(({ theme }) => ({
  padding: 24, borderRadius: 14, border: `1px solid ${theme.mixer(0.12)}`,
  background: theme.mixer(0.025), color: theme.mixer(0.85),
  fontSize: 14, lineHeight: 1.75, overflowWrap: 'anywhere',
  h2: { margin: '0 0 4px', fontSize: 17, fontWeight: 600, color: theme.foreground },
  p: { margin: '16px 0 0' },
  '.copyright': { marginTop: 0, fontSize: 12, color: theme.mixer(0.65) },
  '.warranty': { paddingTop: 18, borderTop: `1px solid ${theme.mixer(0.12)}`, fontSize: 12, lineHeight: 1.8 },
  strong: { fontWeight: 600 },
  '@media (max-width: 600px)': { padding: 18 },
}));

const Footer = styled.footer(({ theme }) => ({
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
  marginTop: 24,
  p: { margin: 0, maxWidth: 360, fontSize: 12, lineHeight: 1.6, color: theme.mixer(0.65) },
  '@media (max-width: 600px)': { flexDirection: 'column', alignItems: 'stretch', gap: 16 },
}));

const AcceptButton = styled(Button)(({ theme }) => ({
  flexShrink: 0, minHeight: 46, height: 'auto', padding: '12px 20px',
  borderRadius: 10, fontSize: 14, fontWeight: 600, whiteSpace: 'normal',
  '&&, &&:hover, &&:active': {
    background: theme.primary,
    color: luminosity(theme.primary) > 0.179 ? '#000000' : '#ffffff',
  },
  '&:hover': { filter: 'brightness(1.08)' },
  '&:focus-visible': { outline: `2px solid ${theme.primary}`, outlineOffset: 4 },
}));

const acceptAgreement = () => updateSettings({ acceptedAgreement: true });

export default function LicenseAgreement() {
  return (
    <Screen>
      <Panel aria-labelledby="agreement-title">
        <Header>
          <div className="brand">Nexus Wallet</div>
          <h1 id="agreement-title">License Agreement</h1>
          <p>Please review the MIT license before continuing.</p>
        </Header>
        <LicenseText aria-labelledby="license-title" lang="en">
      <h2 id="license-title">The MIT License (MIT)</h2>
      <p className="copyright">Copyright {new Date().getFullYear()} Nexus</p>
      <p>
        Permission is hereby granted, free of charge, to any person obtaining a
        copy of this software and associated documentation files (the
        "Software"), to deal in the Software without restriction, including
        without limitation the rights to use, copy, modify, merge, publish,
        distribute, sublicense, and/or sell copies of the Software, and to
        permit persons to whom the Software is furnished to do so, subject to
        the following conditions:
      </p>
      <p>
        The above copyright notice and this permission notice shall be included
        in all copies or substantial portions of the Software.
      </p>
      <p className="warranty">
        <strong>
          THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
          EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
          IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
          CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
          TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
          SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
        </strong>
      </p>
        </LicenseText>
        <Footer>
          <p>By selecting Accept and continue, you confirm that you have read and accept this agreement.</p>
          <AcceptButton skin="filled-primary" onClick={acceptAgreement}>
            Accept and continue
            <span aria-hidden="true" style={{ marginLeft: 16 }}>→</span>
          </AcceptButton>
        </Footer>
      </Panel>
    </Screen>
  );
}
