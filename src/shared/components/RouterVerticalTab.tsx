import { ComponentProps, ReactNode } from 'react';
import { NavLink } from 'react-router';

import VerticalTab from 'components/VerticalTab';
import Icon, { SvgIcon } from './Icon';

const NavLinkVerticalTab = VerticalTab.withComponent(NavLink);

const RouterVerticalTab = ({
  to,
  icon,
  text,
  ...rest
}: Omit<ComponentProps<typeof NavLinkVerticalTab>, 'to'> & {
  to: string;
  icon?: SvgIcon;
  text: ReactNode;
}) => (
  <NavLinkVerticalTab to={to} {...rest}>
    {!!icon && <Icon className="mr0_4" icon={icon} />}
    {text}
  </NavLinkVerticalTab>
);

export default RouterVerticalTab;
