import { fade } from './color';

// Shared by the renderer and module preload; keep this helper lightweight.
export const modernAction = {
  boxSizing: 'border-box', minHeight: 38, height: 'auto',
  padding: '8px 14px', borderRadius: 8, fontSize: 13,
  fontWeight: 500, lineHeight: 1.4, letterSpacing: 0,
  textTransform: 'none', whiteSpace: 'normal',
};

export const modernIconButton = (theme, danger = false) => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  boxSizing: 'border-box', width: 28, height: 28, minHeight: 28,
  flexShrink: 0, padding: 5, borderRadius: 8, fontSize: 13,
  border: '1px solid transparent', cursor: 'pointer',
  color: danger ? theme.danger : theme.mixer(0.75),
  background: 'transparent', boxShadow: 'none', textShadow: 'none',
  '&:hover:not(:disabled)': { color: danger ? theme.danger : theme.primary, background: fade(danger ? theme.danger : theme.primary, 0.9) },
  '&:focus-visible': { outline: `2px solid ${theme.primary}`, outlineOffset: 3 },
  '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
});

export const modernButtonStyle = ({ theme, skin, square, fitHeight, grouped, waiting }) => {
  if (!theme.modern) return undefined;
  const link = ['hyperlink', 'plain-link-primary'].includes(skin);
  const plain = skin.startsWith('plain') && !link;
  const danger = skin.includes('danger');
  const primary = skin.includes('primary');
  const filled = skin.startsWith('filled');
  const accent = danger ? theme.danger : primary ? theme.primary : theme.foreground;
  const background = filled ? (primary || danger ? accent : fade(theme.foreground, 0.9)) : 'transparent';
  const color = filled && primary ? theme.primaryAccent : filled && danger ? theme.dangerAccent : primary || danger ? accent : theme.mixer(0.8);
  const shape = link ? { fontSize: 13, fontWeight: 500, textTransform: 'none', letterSpacing: 0 }
    : plain || square ? modernIconButton(theme, danger) : modernAction;
  return {
    '&&&&': {
      ...shape,
      ...(plain && !square && { width: 'auto', padding: '5px 8px' }),
      ...(fitHeight && { height: 'auto', minHeight: 0, alignSelf: 'stretch' }),
      ...(square && square !== true && { width: square, height: square, minHeight: square }),
      ...(grouped === 'left' && { borderTopRightRadius: 0, borderBottomRightRadius: 0 }),
      ...(grouped === 'right' && { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }),
      ...(grouped === 'top' && { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }),
      ...(grouped === 'bottom' && { borderTopLeftRadius: 0, borderTopRightRadius: 0 }),
      ...(!plain && !link && {
        border: `1px solid ${primary || danger ? accent : fade(theme.foreground, 0.7)}`,
        background, color, boxShadow: 'none', textShadow: 'none',
        '&:hover:not(:disabled)': { background: filled ? (primary || danger ? fade(accent, 0.15) : fade(theme.foreground, 0.82)) : fade(accent, 0.9), color, borderColor: accent, boxShadow: 'none', textShadow: 'none' },
        '&:active:not(:disabled)': { background: filled ? (primary || danger ? fade(accent, 0.25) : fade(theme.foreground, 0.78)) : fade(accent, 0.85) },
        '&:disabled': { background, color, opacity: 0.5, cursor: waiting ? 'wait' : 'not-allowed', boxShadow: 'none', textShadow: 'none' },
      }),
      '&:focus-visible': { outline: `2px solid ${theme.primary}`, outlineOffset: 3 },
    },
  };
};
