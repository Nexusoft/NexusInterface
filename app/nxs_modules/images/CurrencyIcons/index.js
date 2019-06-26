import usd from './USD.sprite.svg';
import gbp from './GBP.sprite.svg';
import clp from './CLP.sprite.svg';
import cny from './CNY.sprite.svg';
import czk from './CZK.sprite.svg';
import eur from './EUR.sprite.svg';
import ils from './ILS.sprite.svg';
import krw from './KRW.sprite.svg';
import pkr from './PKR.sprite.svg';
import rub from './RUB.sprite.svg';
import sar from './SAR.sprite.svg';
import zar from './ZAR.sprite.svg';
import chf from './CHF.sprite.svg';
import twd from './TWD.sprite.svg';
import aed from './AED.sprite.svg';

const DollarSign = usd;
const PoundSign = gbp;
const PesoSign = clp;
const YenSign = cny;
const KorunaSign = czk;
const EuroSign = eur;
const ShekelSign = ils;
const WonSign = krw;
const RubeeSign = pkr;
const RubleSign = rub;
const RiyalSign = sar;
const RandSign = zar;
const FrancSign = chf;
const TaiDollarSign = twd;
const DirhamSign = aed;

export function CurrencyIcon(ISOValue)
{
    switch (ISOValue) {
        case 'USD':
        case 'AUD':
        case 'BRL':
        case 'CAD':
        case 'HKD':
        case 'MYR':
        case 'NZD':
        case 'SGD':
            return(DollarSign);
        case 'GBP':
            return (PoundSign);
        case 'CLP':
        case 'MXN':
            return (PesoSign);
        case 'CNY':
        case 'JPY':
            return(YenSign);
        case 'CZK':
            return(KorunaSign);
        case 'EUR':
            return(EuroSign);
        case 'ILS':
            return( ShekelSign);
        case 'KRW':
            return(WonSign);
        case 'PKR':
            return(RubeeSign);
        case 'RUB':
            return(RubleSign);
        case 'SAR':
            return(RiyalSign);
        case 'ZAR':
            return(RandSign);
        case 'CHF':
            return(FrancSign);
        case 'TWD':
            return(TaiDollarSign);
        case 'AED':
            return(DirhamSign);
        default:
        console.log('default');
            return(DollarSign);
    }
}
