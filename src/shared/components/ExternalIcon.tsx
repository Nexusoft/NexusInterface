import { HTMLAttributes, useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import styled from '@emotion/styled';

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

const getCachedSVG = (() => {
  const cache: Record<string, string> = {};
  return async ({
    moduleName,
    icon,
    url,
  }: {
    moduleName?: string;
    icon?: string;
    url?: string;
  }) => {
    const key = moduleName && icon ? `${moduleName}/${icon}` : url || '';
    if (!key) return '';
    if (cache[key] === undefined) {
      try {
        const content =
          moduleName && icon
            ? (await window.nexusElectron.fileAssets.readModuleIcon(
                moduleName,
                icon
              )).content
            : await window.nexusElectron.fileAssets.fetchExternalIcon(url || '');
        // IMPORTANT! MUST sanitize icon content for security
        return (cache[key] = DOMPurify.sanitize(content));
      } catch {
        return (cache[key] = '');
      }
    } else {
      return cache[key];
    }
  };
})();

export interface ExternalIconProps extends HTMLAttributes<HTMLSpanElement> {
  moduleName?: string;
  icon?: string;
  url?: string;
}

export default function ExternalIcon({
  moduleName,
  icon,
  url,
  ...rest
}: ExternalIconProps) {
  const [svgContent, setSvgContent] = useState<string>();
  useEffect(() => {
    getCachedSVG({ moduleName, icon, url }).then((svg) => {
      setSvgContent(svg);
    });
  }, [moduleName, icon, url]);

  return (
    <SvgWrapper
      {...rest}
      // The icon content has already been sanitized by DOMPurify
      // so it's already safe to insert into html
      dangerouslySetInnerHTML={svgContent ? { __html: svgContent } : undefined}
    />
  );
}
