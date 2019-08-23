// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { remote, shell } from 'electron';
import styled from '@emotion/styled';
import Tooltip from 'components/Tooltip';
import Button from 'components/Button';
import syncingIcon from 'images/syncing.sprite.svg';
import GA from 'lib/googleAnalytics';
import { showNotification } from 'actions/overlays';

// Internal Global Dependencies
import Icon from 'components/Icon';
import Panel from 'components/Panel';
import ContextMenuBuilder from 'contextmenu';
import * as actionsCreators from 'actions/market';

// Internal Local Dependencies
import MarketDepth from './Chart/MarketDepth';
import Candlestick from './Chart/Candlestick';

// Images
import chartIcon from 'images/chart.sprite.svg';
import bittrexLogo from 'images/BittrexLogo.png';
import binanceLogo from 'images/BINANCE.png';

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
const mapDispatchToProps = { ...actionsCreators, showNotification };

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
    window.addEventListener('contextmenu', this.setupcontextmenu, false);
  }
  // React Method (Life cycle hook)
  componentWillUnmount() {
    window.removeEventListener('contextmenu', this.setupcontextmenu);
  }

  // Class Methods
  /**
   * Sets up the page's context menu
   *
   * @param {*} e
   * @memberof Market
   */
  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  /**
   * Refreshes the data from the markets
   *
   * @memberof Market
   */
  refresher() {
    let any = this;
    this.props.binanceDepthLoader();
    this.props.bittrexDepthLoader();

    this.props.binanceCandlestickLoader(any);
    this.props.bittrexCandlestickLoader(any);

    this.props.binance24hrInfo();
    this.props.bittrex24hrInfo();
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
    this.props.showNotification(__('Refreshing market data...'), 'success');
  }

  // Mandatory React method
  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Market
   */
  render() {
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
        {this.props.loaded && this.props.binance.buy[0] && (
          <ExchangeUnitContainer>
            <ExchangeLogo
              src={binanceLogo}
              onClick={() => {
                shell.openExternal('https://www.binance.com/en/trade/NXS_BTC');
              }}
            />
            {this.oneDayinfo('binance')}
            <MarketInfoContainer>
              <MarketDepth
                locale={this.props.settings.locale}
                chartData={this.formatChartData('binanceBuy')}
                chartSellData={this.formatChartData('binanceSell')}
                theme={this.props.theme}
              />
              {this.props.binance.candlesticks[0] !== undefined ? (
                <Candlestick
                  locale={this.props.settings.locale}
                  data={this.props.binance.candlesticks}
                  theme={this.props.theme}
                />
              ) : null}
            </MarketInfoContainer>
          </ExchangeUnitContainer>
        )}
        {this.props.loaded && this.props.bittrex.buy[0] && (
          <ExchangeUnitContainer>
            <ExchangeLogo
              src={bittrexLogo}
              onClick={() => {
                shell.openExternal(
                  'https://bittrex.com/Market/Index?MarketName=BTC-NXS'
                );
              }}
            />
            {this.oneDayinfo('bittrex')}
            <MarketInfoContainer>
              <br />
              <MarketDepth
                locale={this.props.settings.locale}
                chartData={this.formatChartData('bittrexBuy')}
                chartSellData={this.formatChartData('bittrexSell')}
                theme={this.props.theme}
              />
              {this.props.bittrex.candlesticks[0] !== undefined ? (
                <Candlestick
                  locale={this.props.settings.locale}
                  data={this.props.bittrex.candlesticks}
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
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Market);
