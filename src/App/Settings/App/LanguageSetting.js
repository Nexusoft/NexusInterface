// External
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import languages from 'data/languages';
import { updateSettings } from 'lib/settings';
import SettingsField from 'components/SettingsField';
import Select from 'components/Select';
import { confirm } from 'lib/dialog';

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

export default function LanguageSetting() {
  const locale = useSelector((state) => state.settings.locale);

  const handleChange = async (locale) => {
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

  return (
    <SettingsField label={__('Language')}>
      <Select
        options={languageOptions}
        value={locale}
        onChange={handleChange}
      />
    </SettingsField>
  );
}
