import styled from '@emotion/styled';
import {
  Children,
  cloneElement,
  ReactElement,
  ReactNode,
  useRef,
  useState,
} from 'react';

import { arrowStyles } from 'components/Arrow';
import Overlay from 'components/Overlay';
import { animations, consts, timing } from 'styles';

const DropdownComponent = styled.div(({ theme }) => ({
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
      color: theme.background,
    }),
  },
}));

const MenuItem = styled.div(({ theme }) => ({
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
    background: theme.mixer(0.125),
  },
}));

const Separator = styled.div(({ theme }) => ({
  margin: '3px 0',
  borderBottom: `1px solid ${theme.mixer(0.125)}`,
}));

function getDropdownStyle(controlElem?: HTMLElement) {
  if (!controlElem) return {};
  const rect = controlElem.getBoundingClientRect();
  return {
    minWidth: 120,
    top: rect.bottom + 18,
    right: window.innerWidth - rect.right,
  };
}

export default function Dropdown({
  children,
  dropdown,
}: {
  children:
    | ReactElement
    | ((props: { openDropdown: () => void }) => ReactElement);
  dropdown: ReactNode | ((props: { closeDropdown: () => void }) => ReactNode);
}) {
  const [open, setOpen] = useState(false);
  const controlRef = useRef<HTMLElement>();

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
