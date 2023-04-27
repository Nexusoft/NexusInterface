import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { promises } from 'fs';
import styled from '@emotion/styled';
import axios from 'axios';

const SvgWrapper = styled.span({
  display: 'inline-flex',
  verticalAlign: 'middle',
  transitionProperty: 'fill, stroke',
  transitionDuration: '.2s',
  '& > svg': {
    width: '1em',
    height: '1em',
  },
});

async function loadSVGContent(path) {
  try {
    const content = await promises.readFile(path);
    return content;
  } catch (err) {
    return null;
  }
}

async function fetchSVGContent(url) {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (err) {
    return null;
  }
}

const getCachedSVG = (() => {
  const cache = {};
  return async ({ path, url }) => {
    const key = path ? path : url;
    const getContent = path ? loadSVGContent : fetchSVGContent;
    if (cache[key] === undefined) {
      const content = await getContent(key);
      // IMPORTANT! MUST sanitize icon content for security
      return (cache[key] = DOMPurify.sanitize(content));
    } else {
      return cache[key];
    }
  };
})();

export default function ExternalIcon({ path, url, ...rest }) {
  const [svgContent, setSvgContent] = useState(null);
  useEffect(() => {
    getCachedSVG({ path, url }).then((svg) => {
      setSvgContent(svg);
    });
  }, []);

  return (
    <SvgWrapper
      {...rest}
      // The icon content has already been sanitized by DOMPurify
      // so it's already safe to insert into html
      dangerouslySetInnerHTML={svgContent ? { __html: svgContent } : undefined}
    />
  );
}
