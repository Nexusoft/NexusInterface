import { modernAction } from './buttonStyles';
import { fade, mix } from './color';

// Modern dialog tokens; callers apply these only in the Modern theme.
export const modalLayout = {
  radius: 20,
  headerPadding: '20px 24px',
  bodyPadding: '24px',
  footerPadding: '16px 24px 24px',
  mobilePadding: 16,
  titleSize: 20,
};

export const modalSurface = (theme) => ({
  borderRadius: modalLayout.radius,
  border: `1px solid ${fade(theme.primary, 0.75)}`,
  background: `linear-gradient(145deg, ${mix(theme.background, theme.primary, 0.05)}, ${theme.background})`,
  boxShadow: `0 24px 80px rgba(0,0,0,.45), inset 0 1px ${fade(theme.foreground, 0.94)}`,
  color: theme.foreground,
});

export const modalAction = modernAction;

export const modalField = (theme) => ({
  minHeight: 46, borderRadius: 10, padding: '0 12px',
  border: `1px solid ${fade(theme.primary, 0.75)}`,
  background: fade(theme.foreground, 0.96), color: theme.foreground,
  boxShadow: 'none',
  gap: 10,
  '> button': { flexShrink: 0 },
  '&::after': { display: 'none' },
  '&:focus-within': { borderColor: theme.primary, boxShadow: `0 0 0 3px ${fade(theme.primary, 0.9)}` },
  '&[data-field-error="true"]': { borderColor: theme.danger },
  '&[data-field-error="true"]:focus-within': { borderColor: theme.danger, boxShadow: `0 0 0 3px ${fade(theme.danger, 0.9)}` },
  '&[data-multiline="true"]': { minHeight: 100, height: 'auto', padding: 12 },
  '> input, > textarea': { minWidth: 0, flex: '1 1 auto', padding: 0, border: 0, fontSize: 14, color: 'inherit', background: 'transparent', boxShadow: 'none' },
});
