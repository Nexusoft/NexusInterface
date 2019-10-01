import React from 'react';
import styled from '@emotion/styled';

import Button from 'components/Button';
import languages from 'data/languages';
import { timing } from 'styles';
import * as color from 'utils/color';
import { updateSettingsFile } from 'lib/universal/settings';

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

class SelectLanguage extends React.Component {
  state = {
    selection: 'en',
  };

  selectLanguage = lang => {
    this.setState({ selection: lang });
  };

  proceed = () => {
    updateSettingsFile({ locale: this.state.selection });
    location.reload();
  };

  render() {
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
              onClick={this.proceed}
            >
              Select language
            </Button>
          </div>
        }
      >
        {languages.map((lang, i) => (
          <Language
            key={lang.code}
            selected={lang.code === this.state.selection}
            first={i === 0}
            onClick={() => this.selectLanguage(lang.code)}
          >
            <Flag src={lang.flag} />
            {lang.name}
          </Language>
        ))}
      </FullScreen>
    );
  }
}

export default SelectLanguage;
