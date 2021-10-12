import { useRef, useState } from 'react';
import styled from '@emotion/styled';

import Overlay from 'components/Overlay';
import { arrowStyles } from 'components/Arrow';
import { timing, animations, consts } from 'styles';

const DropdownMenuComponent = styled.div(({ theme }) => ({
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

function getDropdownStyle(el) {
  if (!el) return {};
  const rect = el.getBoundingClientRect();
  return {
    minWidth: 120,
    top: rect.bottom + 18,
    right: window.innerWidth - rect.right,
  };
}

export default function DropdownMenu({ renderControl, renderDropdown }) {
  const [open, setOpen] = useState(false);
  const controlRef = useRef();

  const openDropdown = () => {
    setOpen(true);
  };

  const closeDropdown = () => {
    setOpen(false);
  };

  const args = {
    open,
    controlRef,
    openDropdown,
    closeDropdown,
  };

  return (
    <>
      {renderControl(args)}
      {open && (
        <Overlay onBackgroundClick={closeDropdown}>
          <DropdownMenuComponent style={getDropdownStyle(controlRef.current)}>
            {renderDropdown(args)}
          </DropdownMenuComponent>
        </Overlay>
      )}
    </>
  );
}

DropdownMenu.MenuItem = MenuItem;
DropdownMenu.Separator = Separator;
