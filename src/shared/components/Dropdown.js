import { useRef, useState, Children, cloneElement } from 'react';
import styled from '@emotion/styled';

import Overlay from 'components/Overlay';
import { timing, animations } from 'styles';
import { fade, mix } from 'utils/color';
import { arrowStyles } from 'components/Arrow';
import { consts } from 'styles';
import themeStyles from 'utils/themeStyles';

export const DropdownComponent = styled.div(themeStyles([({
  theme
}) => ({
  position: 'fixed',
  background: theme.background,
  color: theme.foreground,
  width: 'max-content',
  padding: '5px 0',
  fontSize: 15,
  borderRadius: 4,
  boxShadow: '0 0 8px rgba(0,0,0,.7)',
  animation: `${animations.fadeIn} ${timing.normal} ease-out`,
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: '100%',
    right: 18,
    ...arrowStyles({
      direction: 'up',
      width: 15,
      height: 8,
      color: theme.background
    })
  }
})], [({
  theme
}) => ({
  position: 'fixed',
  background: `linear-gradient(145deg, ${mix(theme.background, theme.primary, 0.05)}, ${theme.background})`,
  color: theme.foreground,
  width: 'max-content',
  maxWidth: 'calc(100vw - 24px)',
  maxHeight: 'calc(100vh - 120px)',
  overflowY: 'auto',
  padding: 8,
  fontSize: 13,
  lineHeight: 1.5,
  border: `1px solid ${fade(theme.primary, 0.75)}`,
  borderRadius: 14,
  boxShadow: `0 16px 48px rgba(0,0,0,.35), inset 0 1px ${fade(theme.foreground, 0.94)}`,
  animation: `${animations.fadeIn} ${timing.normal} ease-out`
})]));

const MenuItem = styled.div(themeStyles([({
  theme
}) => ({
  display: 'flex',
  alignItems: 'center',
  padding: `0 15px`,
  overflow: 'hidden',
  cursor: 'pointer',
  transition: `background-color ${timing.normal}`,
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  height: consts.inputHeightEm + 'em',
  '&:hover': {
    background: theme.mixer(0.125)
  }
})], [({
  theme
}) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '10px 12px',
  borderRadius: 8,
  overflow: 'hidden',
  cursor: 'pointer',
  transition: `background-color ${timing.normal}, color ${timing.normal}`,
  whiteSpace: 'normal',
  textOverflow: 'ellipsis',
  minHeight: 40,
  '&:hover, &:focus-visible, a:focus-visible &': {
    background: fade(theme.primary, 0.9),
    color: theme.primary
  }
})]));

const Separator = styled.div(themeStyles([({
  theme
}) => ({
  margin: '3px 0',
  borderBottom: `1px solid ${theme.mixer(0.125)}`
})], [({
  theme
}) => ({
  margin: '6px 12px',
  borderBottom: `1px solid ${fade(theme.foreground, 0.9)}`
})]));

function getDropdownStyle(controlElem) {
  if (!controlElem) return {};
  const rect = controlElem.getBoundingClientRect();
  return {
    minWidth: 120,
    top: rect.bottom + 18,
    right: window.innerWidth - rect.right,
  };
}

export default function Dropdown({ children, dropdown }) {
  const [open, setOpen] = useState(false);
  const controlRef = useRef();

  const openDropdown = () => {
    setOpen(true);
  };

  const closeDropdown = () => {
    setOpen(false);
  };

  const controlProps = {
    open,
    openDropdown,
    closeDropdown,
  };

  const dropdownProps = {
    closeDropdown,
  };

  const control =
    typeof children === 'function'
      ? children(controlProps)
      : Children.only(children);
  const clonedControl = cloneElement(control, { ref: controlRef });

  const dropdownContent =
    typeof dropdown === 'function' ? dropdown(dropdownProps) : dropdown;

  return (
    <>
      {clonedControl}
      {open && (
        <Overlay onBackgroundClick={closeDropdown}>
          <DropdownComponent style={getDropdownStyle(controlRef.current)}>
            {dropdownContent}
          </DropdownComponent>
        </Overlay>
      )}
    </>
  );
}

Dropdown.MenuItem = MenuItem;
Dropdown.Separator = Separator;
