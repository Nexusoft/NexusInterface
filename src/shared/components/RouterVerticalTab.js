import { forwardRef } from 'react';
import { NavLink } from 'react-router-dom';

import VerticalTab from 'components/VerticalTab';

const RouterVerticalTab = forwardRef(({ link, icon, text, ...rest }, ref) => (
  <VerticalTab as={NavLink} to={link} ref={ref} {...rest}>
    {!!icon && <Icon className="mr0_4" icon={icon} />}
    {text}
  </VerticalTab>
));

export default RouterVerticalTab;
