/**
 * Important note - This file is imported into module_preload.js, either directly or
 * indirectly, and will be a part of the preload script for modules, therefore:
 * - Be picky with importing stuffs into this file, especially for big
 * files and libraries. The bigger the preload scripts get, the slower the modules
 * will load.
 * - Don't assign anything to `global` variable because it will be passed
 * into modules' execution environment.
 * - Make sure this note also presents in other files which are imported here.
 */

// External Dependencies
import { forwardRef } from 'react';
import { NavLink } from 'react-router-dom';

// Internal Global Dependencies
import HorizontalTab from 'components/HorizontalTab';
import Icon from 'components/Icon';

const RouterHorizontalTab = forwardRef(({ link, icon, text, ...rest }, ref) => (
  <HorizontalTab as={NavLink} to={link} ref={ref} {...rest}>
    {!!icon && <Icon className="mr0_4" icon={icon} />}
    {text}
  </HorizontalTab>
));

RouterHorizontalTab.TabBar = HorizontalTab.TabBar;

export default RouterHorizontalTab;
