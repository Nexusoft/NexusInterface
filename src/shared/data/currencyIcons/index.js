import DollarSign from './USD.svg';
import PoundSign from './GBP.svg';
import PesoSign from './CLP.svg';
import YenSign from './CNY.svg';
import KorunaSign from './CZK.svg';
import EuroSign from './EUR.svg';
import ShekelSign from './ILS.svg';
import WonSign from './KRW.svg';
import RubeeSign from './PKR.svg';
import RubleSign from './RUB.svg';
import RiyalSign from './SAR.svg';
import RandSign from './ZAR.svg';
import FrancSign from './CHF.svg';
import TaiDollarSign from './TWD.svg';
import DirhamSign from './AED.svg';
import BitcoinSign from './BTC.svg';
import DongSign from './VND.svg';
import BahtSign from './THB.svg';

export default function currencyIcon(ISOValue) {
  switch (ISOValue) {
    case 'BTC':
      return BitcoinSign;
    case 'GBP':
      return PoundSign;
    case 'CLP':
    case 'MXN':
      return PesoSign;
    case 'CNY':
    case 'JPY':
      return YenSign;
    case 'CZK':
      return KorunaSign;
    case 'EUR':
      return EuroSign;
    case 'ILS':
      return ShekelSign;
    case 'KRW':
      return WonSign;
    case 'PKR':
      return RubeeSign;
    case 'RUB':
      return RubleSign;
    case 'SAR':
      return RiyalSign;
    case 'ZAR':
      return RandSign;
    case 'CHF':
      return FrancSign;
    case 'TWD':
      return TaiDollarSign;
    case 'AED':
      return DirhamSign;
    case 'VND':
      return DongSign;
    case 'THB':
      return BahtSign;
    default:
      return DollarSign;
  }
}
