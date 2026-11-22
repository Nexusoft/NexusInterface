// External
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { ChromePicker } from 'react-color';
import Color from 'color';

// Internal
import { updateTheme } from 'lib/theme';
import Button from 'components/Button';
import Overlay from 'components/Overlay';
import * as color from 'utils/color';

__ = __context('Settings.Style');

const ColorButton = styled(Button)(({ color: c, open, theme }) => {
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
    ...(theme.modern && {
      // Swatches retain the actual selected color in every interaction state.
      '&&&&&&, &&&&&&:hover, &&&&&&:active, &&&&&&:disabled': {
        width: 112,
        minWidth: 112,
        flexShrink: 0,
        background: c,
        color: contrastColor,
        border: `1px solid ${color.fade(contrastColor, 0.6)}`,
        boxShadow: 'none',
        textShadow: 'none',
        fontVariantNumeric: 'tabular-nums',
      },
    }),
  };
});

export default function ColorPicker({ colorName, fallbackColor, allowOpacity = true }) {
  const btnRef = useRef();
  const [open, setOpen] = useState(false);
  const [pickerStyles, setPickerStyles] = useState({});
  const theme = useSelector((state) => state.theme);
  const currentColor = theme[colorName] || fallbackColor;
  const parsedColor = Color(currentColor);
  const opacity = Math.round(parsedColor.alpha() * 100);

  const saveColor = (value) => {
    updateTheme({ [colorName]: value.alpha() === 1 ? value.hex() : value.rgb().string() });
  };

  const openPicker = () => {
    const btnRect = btnRef.current.getBoundingClientRect();
    const styles = {
      position: 'fixed',
      left: Math.max(8, Math.min(btnRect.left, window.innerWidth - 233)),
      top: Math.max(8, Math.min(btnRect.bottom + 8, window.innerHeight - 260)),
    };
    setOpen(true);
    setPickerStyles(styles);
  };

  const closePicker = () => {
    setOpen(false);
    setPickerStyles({});
  };

  const handleColorChange = (pickedColor) => {
    const { r, g, b, a = 1 } = pickedColor.rgb;
    saveColor(Color.rgb(r, g, b).alpha(a));
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
        {parsedColor.hex()}
      </ColorButton>
      {allowOpacity && (
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginLeft: 12 }}>
          {__('Opacity')}
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={opacity}
            onChange={(event) => saveColor(parsedColor.alpha(Number(event.target.value) / 100))}
            style={{ width: 100, accentColor: '#00b7fa' }}
          />
          <span style={{ width: '5ch', flex: '0 0 5ch', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{opacity}%</span>
        </label>
      )}
      {open && (
        <Overlay onBackgroundClick={closePicker}>
          <div style={pickerStyles}>
            <ChromePicker
              color={currentColor}
              disableAlpha={!allowOpacity}
              onChangeComplete={handleColorChange}
            />
          </div>
        </Overlay>
      )}
    </>
  );
}
