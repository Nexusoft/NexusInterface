// Also used by module preload components; keep this helper dependency-free.
/** Select complete style sets so Modern styles cannot leak into classic themes. */
export default function themeStyles(classic, modern) {
  return (props) => (props.theme.modern ? modern : classic).map(
    (style) => typeof style === 'function' ? style(props) : style
  );
}
