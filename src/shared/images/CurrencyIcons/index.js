import DollarSign from './USD.sprite.svg';
import PoundSign from './GBP.sprite.svg';
import PesoSign from './CLP.sprite.svg';
import YenSign from './CNY.sprite.svg';
import KorunaSign from './CZK.sprite.svg';
import EuroSign from './EUR.sprite.svg';
import ShekelSign from './ILS.sprite.svg';
import WonSign from './KRW.sprite.svg';
import RubeeSign from './PKR.sprite.svg';
import RubleSign from './RUB.sprite.svg';
import RiyalSign from './SAR.sprite.svg';
import RandSign from './ZAR.sprite.svg';
import FrancSign from './CHF.sprite.svg';
import TaiDollarSign from './TWD.sprite.svg';
import DirhamSign from './AED.sprite.svg';
import BitcoinSign from './BTC.sprite.svg';

export function CurrencyIcon(ISOValue) {
  switch (ISOValue) {
    case 'USD':
    case 'AUD':
    case 'BRL':
    case 'CAD':
    case 'HKD':
    case 'MYR':
    case 'NZD':
    case 'SGD':
      return DollarSign;
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
    default:
      return DollarSign;
  }
}
