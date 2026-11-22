import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { fade } from 'utils/color';
import { moduleLayout, moduleAction } from 'utils/moduleStyles';

const SettingsSection = styled.section(({ theme }) => ({
  minWidth: 0, marginBottom: moduleLayout.gap, padding: moduleLayout.compactPadding, borderRadius: 12,
  border: `1px solid ${fade(theme.primary, 0.82)}`, background: fade(theme.background, 0.25),
  '> h2': { margin: '0 0 6px', color: theme.primary, fontSize: moduleLayout.sectionTitleSize, fontWeight: 600, letterSpacing: 0 },
  '.app-setting': { padding: '12px 0', gap: 24, marginLeft: 0, flexDirection: 'row', alignItems: 'center', borderBottom: `1px solid ${fade(theme.foreground, 0.92)}` },
  '.app-setting:last-child': { borderBottom: 0 },
  '.app-setting > label': { fontSize: 13, fontWeight: 500, flex: '1 1 auto' },
  '.app-setting > label > div + div': { marginTop: 4, fontWeight: 400, fontSize: 12 },
  '.app-setting > div': { width: 'auto', maxWidth: '45%', flexShrink: 0 },
  '.app-setting input[type="checkbox"]': { fontSize: 12, margin: 0 },
  '.app-setting input:focus-visible': { outline: `2px solid ${theme.primary}`, outlineOffset: 4 },
  '.app-setting button': moduleAction,
  '.app-setting .preference-select': { width: 280, maxWidth: '100%', minWidth: 0, height: 38, borderRadius: moduleLayout.fieldRadius, fontSize: 12, border: `1px solid ${fade(theme.primary, 0.75)}` },
  '@media (max-width: 600px)': {
    padding: '12px 14px',
    '.app-setting': { gap: 14 },
    '.app-setting.select-setting': { flexDirection: 'column', alignItems: 'stretch', gap: 8 },
    '.app-setting.select-setting > div': { width: '100%', maxWidth: '100%' },
    '.app-setting .preference-select': { width: '100%' },
  },
}));

export default function SettingsGroup({ title, children }) {
  const { modern } = useTheme();
  return modern ? <SettingsSection><h2>{title}</h2>{children}</SettingsSection> : <>{children}</>;
}

