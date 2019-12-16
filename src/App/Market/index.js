// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { shell } from 'electron';
import styled from '@emotion/styled';
import Tooltip from 'components/Tooltip';
import Button from 'components/Button';
import syncingIcon from 'icons/syncing.svg';
import GA from 'lib/googleAnalytics';
import { showNotification } from 'lib/ui';

// Internal Global Dependencies
import Icon from 'components/Icon';
import Panel from 'components/Panel';
import {
  binanceDepthLoader,
  bittrexDepthLoader,
  binance24hrInfo,
  bittrex24hrInfo,
  binanceCandlestickLoader,
  bittrexCandlestickLoader,
  binanceWalletStatus,
  bittrexWalletStatus,
} from 'lib/market';

// Internal Local Dependencies
import MarketDepth from './Chart/MarketDepth';
import Candlestick from './Chart/Candlestick';

// Images
import chartIcon from 'icons/chart.svg';
import bittrexLogo from 'icons/BittrexLogo.png';
import binanceLogo from 'icons/BINANCE.png';

__ = __context('MarketData');

const ExchangeUnitContainer = styled.div({
  width: '100%',
});

const MarketInfoContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  margin: '1.5em 0',
  borderTop: '1px solid #333',
});

const ExchangeLogo = styled.img({
  height: 60,
});

const OneDay = styled.div({
  display: 'grid',
  gridTemplateColumns: 'auto auto',
});

const StatusIcon = styled.div(
  {
    height: '14px',
    width: '14px',
    borderRadius: '50%',
    display: 'inline-block',
    marginBottom: '18px',
  },
  ({ status }) => {
    switch (status) {
      case 'Green':
        return {
          backgroundColor: 'limegreen',
        };
      case 'Yellow':
        return {
          backgroundColor: 'yellow',
        };
      case 'Red':
        return {
          backgroundColor: 'red',
        };

      default:
        return {
          backgroundColor: 'gray',
        };
    }
  }
);

// React-Redux mandatory methods
const mapStateToProps = state => {
  return {
    ...state.market,
    ...state.common,
    ...state.intl,
    theme: state.theme,
    settings: state.settings,
  };
};

/**
 * The Market Page
 *
 * @class Market
 * @extends {Component}
 */
class Market extends Component {
  // React Method (Life cycle hook)
  componentDidMount() {
    this.refresher();
    GA.SendScreen('Market');
  }

  /**
   * Refreshes the data from the markets
   *
   * @memberof Market
   */
  refresher() {
    let any = this;
    binanceDepthLoader();
    bittrexDepthLoader();

    binanceCandlestickLoader(any);
    bittrexCandlestickLoader(any);

    binance24hrInfo();
    bittrex24hrInfo();

    binanceWalletStatus();
    bittrexWalletStatus();
  }

  /**
   * Formats the buy data and returns it
   *
   * @memberof Market
   */
  formatBuyData = array => {
    const { locale } = this.props.settings;
    let newQuantity = 0;
    let prevQuantity = 0;
    let finnishedArray = array
      .map(e => {
        newQuantity = prevQuantity + e.Volume;
        prevQuantity = newQuantity;

        if (e.Price < array[0].Price * 0.05) {
          return {
            x: 0,
            y: newQuantity,
          };
        } else {
          return {
            x: e.Price,
            y: newQuantity,
            label: `${__('Price')}: ${e.Price} \n ${__(
              'Volume'
            )}: ${newQuantity}`,
          };
        }
      })
      .filter(e => e.x > 0);

    return finnishedArray;
  };

  /**
   * Formats the sell data and returns it
   *
   * @param {*} array
   * @returns
   * @memberof Market
   */
  formatSellData(array) {
    let newQuantity = 0;
    let prevQuantity = 0;
    let finnishedArray = array
      .sort((a, b) => b.Rate - a.Rate)
      .map(e => {
        newQuantity = prevQuantity + e.Volume;
        prevQuantity = newQuantity;
        if (e.Price < array[0].Price * 0.05) {
          return {
            x: 0,
            y: newQuantity,
          };
        } else {
          return {
            x: e.Price,
            y: newQuantity,
            label: `${__('Price')}: ${e.Price} \n ${__(
              'Volume'
            )}: ${newQuantity}`,
          };
        }
      })
      .filter(e => e.x > 0);

    return finnishedArray;
  }

  /**
   * Formats the Exchange Data
   *
   * @param {*} exchange
   * @returns
   * @memberof Market
   */
  formatChartData(exchange) {
    const dataSetArray = [];
    switch (exchange) {
      case 'binanceBuy':
        return this.formatBuyData(this.props.binance.buy);
        break;
      case 'binanceSell':
        return this.formatBuyData(this.props.binance.sell);
        break;
      case 'bittrexBuy':
        return this.formatBuyData(this.props.bittrex.buy);
        break;
      case 'bittrexSell':
        return this.formatBuyData(this.props.bittrex.sell);
        break;
      default:
        return [];
        break;
    }
  }

  /**
   * Returns a Div of various market data from the Exchange Name
   *
   * @param {*} exchangeName
   * @returns
   * @memberof Market
   */
  oneDayinfo(exchangeName) {
    return (
      <>
        <div
          style={{
            display: 'table-cell',
            verticalAlign: 'middle',
          }}
        >
          <b>{__('24hr Change')}</b>
        </div>
        <OneDay>
          <div>
            <b>{__('High')}: </b>
            {this.props[exchangeName].info24hr.high}
            {' BTC '}
          </div>
          <div>
            <b>{__('Price Change')}: </b>
            {this.props[exchangeName].info24hr.change}
            {' %'}
          </div>
          <div>
            <b>{__('Low')}: </b> {this.props[exchangeName].info24hr.low}
            {' BTC '}
          </div>
          <div>
            <b>{__('Volume')}: </b>
            {this.props[exchangeName].info24hr.volume}
            {' NXS '}
          </div>
        </OneDay>
      </>
    );
  }
  /**
   * Refreshes the market data and shows a notification
   *
   * @memberof Market
   */
  refreshMarket() {
    this.refresher();
    showNotification(__('Refreshing market data...'), 'success');
  }

  returnWalletStatusTooltip(status) {
    switch (status) {
      case 'Green':
        return __('Wallet Active');
      case 'Yellow':
        return __('Wallet Partially Active');
      case 'Red':
        return __('Wallet Under Maintenance');

      default:
        return __('Wallet Status Unknown');
    }
  }

  // Mandatory React method
  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Market
   */
  render() {
    const { binance, bittrex } = this.props;
    return (
      <Panel
        controls={
          <Tooltip.Trigger tooltip={__('Refresh')}>
            <Button square skin="primary" onClick={() => this.refreshMarket()}>
              <Icon icon={syncingIcon} />
            </Button>
          </Tooltip.Trigger>
        }
        icon={chartIcon}
        title={__('Market Data')}
      >
        {this.props.loaded && binance.buy[0] && (
          <ExchangeUnitContainer>
            <ExchangeLogo
              src={binanceLogo}
              onClick={() => {
                shell.openExternal('https://www.binance.com/en/trade/NXS_BTC');
              }}
            />
            <Tooltip.Trigger
              tooltip={this.returnWalletStatusTooltip(binance.walletStatus)}
            >
              <StatusIcon status={binance.walletStatus} />
            </Tooltip.Trigger>

            {this.oneDayinfo('binance')}
            <MarketInfoContainer>
              <MarketDepth
                locale={this.props.settings.locale}
                chartData={this.formatChartData('binanceBuy')}
                chartSellData={this.formatChartData('binanceSell')}
                theme={this.props.theme}
              />
              {binance.candlesticks[0] !== undefined ? (
                <Candlestick
                  locale={this.props.settings.locale}
                  data={binance.candlesticks}
                  theme={this.props.theme}
                />
              ) : null}
            </MarketInfoContainer>
          </ExchangeUnitContainer>
        )}
        {this.props.loaded && bittrex.buy[0] && (
          <ExchangeUnitContainer>
            <ExchangeLogo
              src={bittrexLogo}
              onClick={() => {
                shell.openExternal(
                  'https://bittrex.com/Market/Index?MarketName=BTC-NXS'
                );
              }}
            />
            <Tooltip.Trigger
              tooltip={this.returnWalletStatusTooltip(bittrex.walletStatus)}
            >
              <StatusIcon status={bittrex.walletStatus} />
            </Tooltip.Trigger>

            {this.oneDayinfo('bittrex')}
            <MarketInfoContainer>
              <br />
              <MarketDepth
                locale={this.props.settings.locale}
                chartData={this.formatChartData('bittrexBuy')}
                chartSellData={this.formatChartData('bittrexSell')}
                theme={this.props.theme}
              />
              {bittrex.candlesticks[0] !== undefined ? (
                <Candlestick
                  locale={this.props.settings.locale}
                  data={bittrex.candlesticks}
                  theme={this.props.theme}
                />
              ) : null}
            </MarketInfoContainer>
          </ExchangeUnitContainer>
        )}
      </Panel>
    );
  }
}

// Mandatory React-Redux method
export default connect(mapStateToProps)(Market);
