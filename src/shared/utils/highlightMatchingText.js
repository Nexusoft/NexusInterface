import { escapeRegExp } from 'utils/misc';

export default function highlightMatchingText(text, query, HighlightComponent) {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'i');
  const segments = text.split(regex).map((segment, i) => {
    if (regex.test(segment)) {
      return <HighlightComponent key={i}>{segment}</HighlightComponent>;
    } else {
      return <span key={i}>{segment}</span>;
    }
  });
  return segments;
}
