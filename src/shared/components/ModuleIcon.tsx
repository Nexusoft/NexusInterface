import styled from '@emotion/styled';
import DOMPurify from 'dompurify';

import Icon from 'components/Icon';
import legoBlockIcon from 'icons/lego-block.svg';
import { Module } from 'lib/modules';
import { HTMLAttributes, useEffect, useState } from 'react';
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

const iconCache = new Map<string, { type: 'svg' | 'url'; content: string }>();

async function loadIcon(module: Module) {
  const candidates = module.info.icon
    ? [module.info.icon]
    : ['icon.svg', 'icon.png'];
  for (const icon of candidates) {
    const cacheKey = `${module.info.name}/${icon}`;
    try {
      if (!iconCache.has(cacheKey)) {
        iconCache.set(
          cacheKey,
          await window.nexusElectron.fileAssets.readModuleIcon(
            module.info.name,
            icon
          )
        );
      }
      return iconCache.get(cacheKey);
    } catch {
      // Try the conventional fallback icon before showing the generic icon.
    }
  }
  return undefined;
}

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
  const [asset, setAsset] = useState<
    { type: 'svg' | 'url'; content: string } | undefined
  >();

  useEffect(() => {
    let active = true;
    loadIcon(module).then((icon) => {
      if (active) setAsset(icon);
    });
    return () => {
      active = false;
    };
  }, [module.info.name, module.info.icon]);

  if (asset?.type === 'svg') {
    return (
      <SvgWrapper
        {...rest}
        // The icon content has already been sanitized by DOMPurify
        // so it's already safe to insert into html
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(asset.content) }}
      />
    );
  }
  if (asset?.type === 'url') {
    return <Img src={asset.content} {...rest} />;
  }

  return <Icon icon={legoBlockIcon} {...rest} />;
}
