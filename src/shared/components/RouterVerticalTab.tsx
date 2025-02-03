import { ComponentProps, forwardRef, ReactNode } from 'react';
import { NavLink } from 'react-router';

import VerticalTab from 'components/VerticalTab';
import Icon, { SvgIcon } from './Icon';

const NavLinkVerticalTab = VerticalTab.withComponent(NavLink);

const RouterVerticalTab = forwardRef<
  HTMLAnchorElement,
  Omit<ComponentProps<typeof NavLinkVerticalTab>, 'to'> & {
    link: string;
    icon?: SvgIcon;
    text: ReactNode;
  }
>(({ link, icon, text, ...rest }, ref) => (
  <NavLinkVerticalTab to={link} ref={ref} {...rest}>
    {!!icon && <Icon className="mr0_4" icon={icon} />}
    {text}
  </NavLinkVerticalTab>
));

export default RouterVerticalTab;
