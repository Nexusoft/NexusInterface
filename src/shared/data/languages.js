import RussiaFlag from './flags/ru.png';
import SpainFlag from './flags/es.png';
import KoreaFlag from './flags/kr.png';
import GermanyFlag from './flags/de.png';
import JapanFlag from './flags/jp.png';
import FranceFlag from './flags/fr.png';
import NetherlandsFlag from './flags/nl.png';
import PolishFlag from './flags/pl.png';
import PortugueseFlag from './flags/pt.png';
import USUKFlag from './flags/US-UK.png';

/**
 * NOTE: If this list is updated, also update the one in
 * /internals/scripts/extractTransactions.js
 */
const languages = [
  {
    code: 'en',
    flag: USUKFlag,
    name: 'English',
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
    code: 'fr',
    flag: FranceFlag,
    name: 'Français',
  },
  {
    code: 'ko',
    flag: KoreaFlag,
    name: '한국어',
  },
  {
    code: 'ja',
    flag: JapanFlag,
    name: '日本語',
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
    code: 'ru',
    flag: RussiaFlag,
    name: 'Pусский',
  },
];

export default languages;
