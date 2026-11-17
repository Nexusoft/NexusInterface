import { HTMLAttributes } from 'react';
import { NativeLink } from 'components/Link';

/**
 * External links to be opened on browser.
 * Need to keep this separated with Link component because this has imports
 * from electron and Link component is passed to modules through API.
 */
export default function ExternalLink(
  props: HTMLAttributes<HTMLAnchorElement> & {
    href: string;
  }
) {
  return (
    <NativeLink
      {...props}
      onClick={(e) => {
        e.preventDefault();
        const url = e.currentTarget.href || props.href;
        if (url) window.nexusElectron.app.openExternal(url).catch(console.error);
        props.onClick && props.onClick(e);
      }}
    />
  );
}
