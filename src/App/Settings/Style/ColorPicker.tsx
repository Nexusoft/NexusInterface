// External
import { useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import styled from '@emotion/styled';
import { ChromePicker } from 'react-color';

// Internal
import { Theme, themeAtom, updateTheme } from 'lib/theme';
import Button from 'components/Button';
import Overlay from 'components/Overlay';
import { fade, isDark } from 'utils/color';

__ = __context('Settings.Style');

const styledButton = styled(Button);

const ColorButton = styledButton<{ color?: string; open?: boolean }>(
  ({ color, open }) => {
    if (!color) return undefined;
    const contrastColor = isDark(color) ? '#fff' : '#000';
    return {
      '&, &:active, &&[disabled]': {
        background: color,
        color: open ? contrastColor : fade(contrastColor, 0.3),
        border: `1px solid ${open ? contrastColor : fade(contrastColor, 0.3)}`,
        transitionProperty: 'color, border-color',
      },
      '&:hover': {
        color: contrastColor,
        borderColor: contrastColor,
      },
    };
  }
);

export default function ColorPicker({ colorName }: { colorName: keyof Theme }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [pickerStyles, setPickerStyles] = useState({});
  const theme = useAtomValue(themeAtom);
  const currentColor = theme[colorName];

  const openPicker = () => {
    if (!btnRef.current) return;
    const btnRect = btnRef.current.getBoundingClientRect();
    const styles = {
      position: 'fixed',
      left: btnRect.right + 10,
      top: (btnRect.top + btnRect.bottom) / 2,
      transform: 'translateY(-50%)',
    };
    setOpen(true);
    setPickerStyles(styles);
  };

  const closePicker = () => {
    setOpen(false);
    setPickerStyles({});
  };

  return (
    <>
      <ColorButton
        ref={btnRef}
        uppercase
        color={currentColor}
        open={open}
        onClick={openPicker}
      >
        {currentColor}
      </ColorButton>
      {open && (
        <Overlay onBackgroundClick={closePicker}>
          <div style={pickerStyles}>
            <ChromePicker
              color={currentColor}
              disableAlpha={true}
              onChangeComplete={(pickedColor) => {
                updateTheme({ [colorName]: pickedColor.hex });
              }}
            />
          </div>
        </Overlay>
      )}
    </>
  );
}
