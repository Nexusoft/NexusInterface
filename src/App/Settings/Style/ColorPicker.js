// External
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { ChromePicker } from 'react-color';

// Internal
import { updateTheme } from 'lib/theme';
import Button from 'components/Button';
import Overlay from 'components/Overlay';
import * as color from 'utils/color';

__ = __context('Settings.Style');

const ColorButton = styled(Button)(({ color: c, open }) => {
  const contrastColor = color.isDark(c) ? '#fff' : '#000';
  return {
    '&, &:active, &&[disabled]': {
      background: c,
      color: open ? contrastColor : color.fade(contrastColor, 0.3),
      border: `1px solid ${
        open ? contrastColor : color.fade(contrastColor, 0.3)
      }`,
      transitionProperty: 'color, border-color',
    },
    '&:hover': {
      color: contrastColor,
      borderColor: contrastColor,
    },
  };
});

export default function ColorPicker({ colorName }) {
  const btnRef = useRef();
  const [open, setOpen] = useState(false);
  const [pickerStyles, setPickerStyles] = useState({});
  const theme = useSelector((state) => state.theme);
  const currentColor = theme[colorName];

  const openPicker = () => {
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

  const handleColorChange = (pickedColor) => {
    updateTheme({ [colorName]: pickedColor.hex });
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
              onChangeComplete={handleColorChange}
            />
          </div>
        </Overlay>
      )}
    </>
  );
}
