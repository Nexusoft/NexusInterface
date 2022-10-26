import { useState } from 'react';
import styled from '@emotion/styled';

import Button from 'components/Button';
import languages from 'data/languages';
import { timing } from 'styles';
import * as color from 'utils/color';
import { updateSettingsFile } from 'lib/settings/universal';

import FullScreen from './FullScreen';

const Flag = styled.img({
  marginRight: '.5em',
  verticalAlign: 'middle',
});

const Language = styled.div(
  ({ first, theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1em 0',
    borderRadius: 2,
    border: `1px solid transparent`,
    borderTop: first ? undefined : `1px solid ${theme.mixer(0.125)}`,
    transitionProperty: 'background-color, color, border-color',
    transitionDuration: timing.normal,
    cursor: 'pointer',
    '&:hover': {
      background: theme.background,
    },
  }),
  ({ selected, theme }) =>
    selected && {
      '&, &:hover': {
        borderColor: theme.primary,
        background: color.fade(theme.primary, 0.5),
        color: theme.primaryAccent,
      },
    }
);

export default function SelectLanguage() {
  const [selection, setSelection] = useState('en');

  const proceed = () => {
    updateSettingsFile({ locale: selection });
    location.reload();
  };

  return (
    <FullScreen
      width={500}
      header="Language"
      footer={
        <div>
          <Button
            wide
            uppercase
            skin="primary"
            style={{ fontSize: 16 }}
            onClick={proceed}
          >
            Select language
          </Button>
        </div>
      }
    >
      {languages.map((lang, i) => (
        <Language
          key={lang.code}
          selected={lang.code === selection}
          first={i === 0}
          onClick={() => setSelection(lang.code)}
        >
          <Flag src={lang.flag} />
          {lang.name}
        </Language>
      ))}
    </FullScreen>
  );
}
