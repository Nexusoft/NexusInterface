import { forwardRef } from 'react';
import { shell } from 'electron';
import Link from 'components/Link';

/**
 * External links to be opened on browser.
 * Need to keep this separated with Link component because this has imports
 * from electron and Link component is passed to modules through API.
 *
 * @param {*} props
 */
const ExternalLink = forwardRef((props, ref) => (
  <Link
    {...props}
    ref={ref}
    as="a"
    onClick={(e) => {
      e.preventDefault();
      shell.openExternal(e.target.href || props.href);
      props.onClick && props.onClick(e);
    }}
  />
));

export default ExternalLink;
