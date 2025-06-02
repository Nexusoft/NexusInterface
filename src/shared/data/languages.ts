import RussiaFlag from './flags/ru.png';
import SpainFlag from './flags/es.png';
import KoreaFlag from './flags/kr.png';
import GermanyFlag from './flags/de.png';
import JapanFlag from './flags/jp.png';
import FranceFlag from './flags/fr.png';
import NetherlandsFlag from './flags/nl.png';
import PolishFlag from './flags/pl.png';
import PortugueseFlag from './flags/pt.png';
import ChineseSimpleFlag from './flags/cn.png';
import FinnishFlag from './flags/fi.png';
import ArabicFlag from './flags/arabic.png';
import HungarianFlag from './flags/hu.png';
import RomanianFlag from './flags/ro.png';
import NorwegianFlag from './flags/no.png';
import SerbianFlag from './flags/rs.png';
import USUKFlag from './flags/US-UK.png';

type LanguageInfo = {
  code: string,
  flag: string,
  name: string,
};

/**
 * NOTE: If this list is updated, also update the one in
 * /internals/scripts/extractTransactions.js
 */
const languages: LanguageInfo[] = [
  {
    code: 'en',
    flag: USUKFlag,
    name: 'English',
  },
  {
    code: 'ar',
    flag: ArabicFlag,
    name: 'العَرَبِيَّة‎',
  },
  {
    code: 'de',
    flag: GermanyFlag,
    name: 'Deutsch',
  },
  {
    code: 'es',
    flag: SpainFlag,
    name: 'Español',
  },
  {
    code: 'fi',
    flag: FinnishFlag,
    name: 'Suomi',
  },
  {
    code: 'fr',
    flag: FranceFlag,
    name: 'Français',
  },
  {
    code: 'hu',
    flag: HungarianFlag,
    name: 'Magyar Nyelv',
  },
  {
    code: 'ja',
    flag: JapanFlag,
    name: '日本語',
  },
  {
    code: 'ko',
    flag: KoreaFlag,
    name: '한국어',
  },
  {
    code: 'no',
    flag: NorwegianFlag,
    name: 'Norsk',
  },
  {
    code: 'nl',
    flag: NetherlandsFlag,
    name: 'Nederlands',
  },
  {
    code: 'pl',
    flag: PolishFlag,
    name: 'Polski',
  },
  {
    code: 'pt',
    flag: PortugueseFlag,
    name: 'Portuguese',
  },
  {
    code: 'ro',
    flag: RomanianFlag,
    name: 'Romanian',
  },
  {
    code: 'ru',
    flag: RussiaFlag,
    name: 'Pусский',
  },
  {
    code: 'sr',
    flag: SerbianFlag,
    name: 'српски',
  },
  {
    code: 'zh-cn',
    flag: ChineseSimpleFlag,
    name: '汉字',
  },
];

export default languages;
