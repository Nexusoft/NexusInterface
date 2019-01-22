// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import Text from 'components/Text';
import * as FlagFile from 'images/LanguageFlags';
import { updateSettings } from 'actions/settingsActionCreators';
import SettingsField from 'components/SettingsField';
import Select from 'components/Select';

const Flag = styled.img({
  marginRight: '.5em',
  verticalAlign: 'middle',
});

const languages = [
  {
    value: 'en',
    display: (
      <span>
        <Flag src={FlagFile.America} />
        <span className="v-align">English (US)</span>
      </span>
    ),
  },
  {
    value: 'ru',
    display: (
      <span>
        <Flag src={FlagFile.Russia} />
        <span className="v-align">Pусский</span>
      </span>
    ),
  },
  {
    value: 'es',
    display: (
      <span>
        <Flag src={FlagFile.Spain} />
        <span className="v-align">Español</span>
      </span>
    ),
  },
  {
    value: 'ko',
    display: (
      <span>
        <Flag src={FlagFile.Korea} />
        <span className="v-align">한국어</span>
      </span>
    ),
  },
  {
    value: 'de',
    display: (
      <span>
        <Flag src={FlagFile.Germany} />
        <span className="v-align">Deutsch</span>
      </span>
    ),
  },
  {
    value: 'ja',
    display: (
      <span>
        <Flag src={FlagFile.Japan} />
        <span className="v-align">日本語</span>
      </span>
    ),
  },
  {
    value: 'fr',
    display: (
      <span>
        <Flag src={FlagFile.France} />
        <span className="v-align">Français</span>
      </span>
    ),
  },
];

const mapStateToProps = state => ({
  locale: state.settings.locale,
});

const mapDispatchToProps = dispatch => ({
  updateSettings: updates => dispatch(updateSettings(updates)),
});

@connect(
  mapStateToProps,
  mapDispatchToProps
)
export default class LanguageSetting extends Component {
  handleChange = locale => this.props.updateSettings({ locale });

  render() {
    return (
      <SettingsField label={<Text id="Settings.Language" />}>
        <Select
          options={languages}
          value={this.props.locale}
          onChange={this.handleChange}
        />
      </SettingsField>
    );
  }
}
