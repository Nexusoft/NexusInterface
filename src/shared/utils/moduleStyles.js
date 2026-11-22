import { modernAction } from './buttonStyles';
import { fade, mix } from './color';

// Shared by built-in module screens. Overview deliberately keeps its own design.
export const moduleLayout = {
  pagePadding: '16px 20px 12px',
  pageInset: '16px 20px',
  panelPadding: '16px 20px',
  compactPadding: '12px 16px',
  gap: 12,
  radius: 12,
  fieldRadius: 8,
  titleSize: 18,
  sectionTitleSize: 16,
  titleIconSize: 24,
  sectionIconSize: 20,
  controlHeight: 38,
  textSize: 13,
  hintSize: 12,
  monoFont: '"Consolas", "SFMono-Regular", monospace',
};

export const modulePanel = (theme) => ({
  fontSize: moduleLayout.textSize,
  lineHeight: 1.5,
  border: `1px solid ${fade(theme.primary, 0.82)}`,
  borderRadius: moduleLayout.radius,
  background: `linear-gradient(135deg, ${mix(theme.background, theme.primary, 0.055)}, ${theme.background})`,
  boxShadow: `inset 0 1px ${fade(theme.foreground, 0.96)}`,
});

export const moduleAction = modernAction;

export const moduleTabs = (theme) => ({
  ...modulePanel(theme), display: 'flex', margin: 0, padding: 8,
  gap: 8, flexWrap: 'wrap',
});

export const moduleTab = (theme) => ({
  ...modernAction, margin: 0, padding: '8px 14px', border: '1px solid transparent',
  borderRadius: 10, fontSize: 13,
  '&:hover': { background: fade(theme.primary, 0.95) },
  '&.active, &[aria-selected="true"]': {
    background: fade(theme.primary, 0.88),
    borderColor: fade(theme.primary, 0.7), color: theme.primary,
  },
});
