import styled from '@emotion/styled';
import DOMPurify from 'dompurify';
import { readFileSync } from 'fs';

import Icon from 'components/Icon';
import legoBlockIcon from 'icons/lego-block.svg';
import { Module } from 'lib/modules';
import { HTMLAttributes } from 'react';
import { CommonProperties } from 'utils/universal';

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

const Img = styled.img({
  verticalAlign: 'middle',
  transitionProperty: 'fill, stroke',
  transitionDuration: '.2s',
  width: '1em',
  height: '1em',
});

const loadSVGContent = (path: string) => {
  try {
    const content = readFileSync(path, 'utf8');
    // IMPORTANT! MUST sanitize icon content for security
    return DOMPurify.sanitize(content);
  } catch (err) {
    return null;
  }
};

const getCachedSVG = (() => {
  const cache: Record<string, string | null> = {};
  return (path: string) =>
    cache[path] === undefined
      ? (cache[path] = loadSVGContent(path))
      : cache[path];
})();

type CommonHTMLAttributes = CommonProperties<
  HTMLAttributes<SVGSVGElement>,
  CommonProperties<
    HTMLAttributes<HTMLSpanElement>,
    HTMLAttributes<HTMLImageElement>
  >
>;

export default function ModuleIcon({
  module,
  ...rest
}: CommonHTMLAttributes & { module: Module }) {
  if (module.iconPath) {
    if (module.iconPath.endsWith('.svg')) {
      const iconContent = getCachedSVG(module.iconPath);
      if (iconContent) {
        return (
          <SvgWrapper
            {...rest}
            // The icon content has already been sanitized by DOMPurify
            // so it's already safe to insert into html
            dangerouslySetInnerHTML={{ __html: iconContent }}
          />
        );
      }
    } else {
      return <Img src={module.iconPath} {...rest} />;
    }
  }

  return <Icon icon={legoBlockIcon} {...rest} />;
}
