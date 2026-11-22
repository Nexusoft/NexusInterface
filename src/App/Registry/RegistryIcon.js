const shapes = {
  Names: <><circle cx="12" cy="12" r="3.5" /><path d="M15.5 8.5v4.75a2.75 2.75 0 0 0 5.5 0V12a9 9 0 1 0-3.6 7.2" /></>,
  Namespaces: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
  Assets: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9M8 5.25l8 4.5v4" /></>,
  Tokens: <><circle cx="10" cy="10" r="7" /><path d="M16.5 7.2A7 7 0 1 1 7.2 16.5" /><path d="M10 6v8M8 7h2.75a1.5 1.5 0 0 1 0 3h-1.5a1.5 1.5 0 0 0 0 3H12" /></>,
};

export default function RegistryIcon({ section, size = 20 }) {
  // GlobalStyles fills SVGs by default; outline icons must override that CSS.
  return <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={{ display: 'block', flexShrink: 0, fill: 'none', stroke: 'currentColor' }}>{shapes[section]}</svg>;
}
