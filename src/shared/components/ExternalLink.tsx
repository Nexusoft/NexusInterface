import { forwardRef, HTMLAttributes } from 'react';
import { shell } from 'electron';
import { NativeLink } from 'components/Link';

/**
 * External links to be opened on browser.
 * Need to keep this separated with Link component because this has imports
 * from electron and Link component is passed to modules through API.
 *
 * @param {*} props
 */
const ExternalLink = forwardRef<
  HTMLAnchorElement,
  HTMLAttributes<HTMLAnchorElement> & {
    href: string;
  }
>((props, ref) => (
  <NativeLink
    {...props}
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      const target = e.target as HTMLAnchorElement;
      const url = target.href || props.href;
      if (url) shell.openExternal(url);
      props.onClick && props.onClick(e);
    }}
  />
));

export default ExternalLink;
