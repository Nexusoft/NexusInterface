import { HTMLAttributes, useEffect, useState } from 'react';
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

async function loadSVGContent(path: string) {
  try {
    const content = await promises.readFile(path);
    return content;
  } catch (err) {
    return null;
  }
}

async function fetchSVGContent(url: string) {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (err) {
    return null;
  }
}

const getCachedSVG = (() => {
  const cache: Record<string, string> = {};
  return async ({ path, url }: { path?: string; url?: string }) => {
    const key = (path ? path : url) || '';
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

export interface ExternalIconProps extends HTMLAttributes<HTMLSpanElement> {
  path?: string;
  url?: string;
}

export default function ExternalIcon({
  path,
  url,
  ...rest
}: ExternalIconProps) {
  const [svgContent, setSvgContent] = useState<string>();
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
