// External
import { Component } from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import languages from 'data/languages';
import { updateSettings } from 'lib/settings';
import SettingsField from 'components/SettingsField';
import Select from 'components/Select';
import { confirm } from 'lib/ui';

__ = __context('Settings.Application');

const Flag = styled.img({
  marginRight: '.5em',
  verticalAlign: 'middle',
});

const languageOptions = languages.map((lang) => ({
  value: lang.code,
  display: (
    <span>
      <Flag src={lang.flag} />
      <span className="v-align">{lang.name}</span>
    </span>
  ),
}));

const mapStateToProps = (state) => ({
  locale: state.settings.locale,
});

/**
 * Internal JSX for Language Settings
 *
 * @class LanguageSetting
 * @extends {Component}
 */
@connect(mapStateToProps)
class LanguageSetting extends Component {
  /**
   * Handle Change
   *
   * @memberof LanguageSetting
   */
  handleChange = async (locale) => {
    if (locale !== 'en') {
      const language = languages.find((lang) => lang.code === locale);
      const agreed = await confirm({
        question: __('Switch language?'),
        note: __(
          'Translations for %{language} are contributed by our amazing community members',
          {
            language: language.name,
          }
        ),
        labelYes: __('Switch to %{language}', { language: language.name }),
        labelNo: __('Cancel'),
      });
      if (!agreed) return;
    }
    updateSettings({ locale });
    location.reload();
  };

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof LanguageSetting
   */
  render() {
    return (
      <SettingsField label={__('Language')}>
        <Select
          options={languageOptions}
          value={this.props.locale}
          onChange={this.handleChange}
        />
      </SettingsField>
    );
  }
}
export default LanguageSetting;
