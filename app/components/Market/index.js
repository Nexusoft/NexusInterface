import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import ReactTable from "react-table";

import styles from "./style.css";
import * as TYPE from "../../actions/actiontypes";
import MarketDepth from "../Chart/MarketDepth";
import Candlestick from "../Chart/Candlestick";

// import images
import bittrexLogo from "../../images/BittrexLogo.png";
import binanceLogo from "../../images/BINANCE.png";
import cryptopiaLogo from "../../images/cryptopia.png";
import * as actionsCreators from "../../actions/marketActionCreators";

import { VictoryArea, VictoryChart, VictoryAnimation } from "victory";

const mapStateToProps = state => {
  return { ...state.market };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(actionsCreators, dispatch);

class Market extends Component {
  // thunk API calls to the exchanges
  componentDidMount() {
    this.refresher();
  }

  refresher() {
    this.props.binanceDepthLoader();
    this.props.bittrexDepthLoader();
    this.props.cryptopiaDepthLoader();
    this.props.binanceCandlestickLoader();
    this.props.bittrexCandlestickLoader();
    this.props.cryptopiaCandlestickLoader();
  }

  arbitageAlert() {
    let lowArr = [],
      highArr = [],
      arbArr = [[], [], []];

    lowArr.push({
      exchange: "binance",
      ...this.props.binance.sell[this.props.binance.sell.length - 1]
    });
    lowArr.push({
      exchange: "bittrex",
      ...this.props.bittrex.sell[this.props.bittrex.sell.length - 1]
    });
    lowArr.push({
      exchange: "cryptopia",
      ...this.props.cryptopia.sell[this.props.cryptopia.sell.length - 1]
    });
    highArr.push({
      exchange: "binance",
      ...this.props.binance.buy[0]
    });
    highArr.push({
      exchange: "bittrex",
      ...this.props.bittrex.buy[0]
    });
    highArr.push({
      exchange: "cryptopia",
      ...this.props.cryptopia.buy[0]
    });

    let alerts = highArr
      .map((high, i) => {
        const highPrice = high.Price;
        return lowArr
          .map((low, index) => {
            if (high.exchange !== low.exchange) {
              const lowPrice = low.Price;
              let arb = highPrice - lowPrice;
              if (arb > 0) {
                console.log("ARBITRAGE!!!");
                return {
                  fromExcange: high.exchange,
                  value: arb.toFixed(8),
                  ...low
                };
              } else return null;
            }
          })
          .filter(e => {
            if (e != null) {
              return e;
            }
          });
      })
      .filter(e => {
        if (e.length != 0) {
          return e;
        }
      })
      .map(arrayOfObj => {
        return arrayOfObj.map(obj => {
          return (
            <div>
              NXS {obj.Volume}, BTC {obj.Price}, arb diff: {obj.value} BTC,{" "}
              {obj.fromExcange} => {obj.exchange}
            </div>
          );
        });
      });
    if (alerts.length > 0) {
      alerts.reduce((accumulator, currentValue) =>
        accumulator.concat(currentValue)
      );
    }
    return alerts;
    console.log(alerts);
  }

  oneDayInfo(exchange) {
    return (
      <div className="marketSummaryTable">
        <div>24hr Market Summary</div>
        <div>High Price: {this.props[exchange].info24hr.high}</div>
        <div>Low Price: {this.props[exchange].info24hr.low}</div>
        <div>
          Price Change:{" "}
          {parseFloat(this.props[exchange].info24hr.change).toFixed(2)}%
        </div>
        <div>Volume: {this.props[exchange].info24hr.volume}</div>
      </div>
    );
  }

  formatBuyData(array) {
    let newQuantity = 0;
    let prevQuantity = 0;
    let finnishedArray = array
      .map(e => {
        newQuantity = prevQuantity + e.Volume;
        prevQuantity = newQuantity;
        if (e.Price < array[0].Price * 0.05) {
          return {
            x: 0,
            y: newQuantity
          };
        } else {
          return {
            x: e.Price,
            y: newQuantity,
            label: `Price: ${e.Price} \n Volume: ${newQuantity}`
          };
        }
      })
      .filter(e => e.x > 0);

    return finnishedArray;
  }

  formatChartData(exchange) {
    const dataSetArray = [];
    switch (exchange) {
      case "binanceBuy":
        return [...this.formatBuyData(this.props.binance.buy)];
        break;
      case "binanceSell":
        return [...this.formatBuyData([...this.props.binance.sell].reverse())];
        break;
      case "bittrexBuy":
        return [...this.formatBuyData(this.props.bittrex.buy)];
        break;
      case "bittrexSell":
        return [...this.formatBuyData([...this.props.bittrex.sell].reverse())];
        break;
      case "cryptopiaBuy":
        return [...this.formatBuyData(this.props.cryptopia.buy)];
        break;
      case "cryptopiaSell":
        return [
          ...this.formatBuyData([...this.props.cryptopia.sell].reverse())
        ];
        break;
      default:
        return [];
        break;
    }
    return [...this.formatBuyData(this.props.binance.buy)];
  }

  render() {
    return (
      <div id="Market">
        <div>
          <button onClick={() => this.refresher()}>Refresh</button>
          <h1>Market Information</h1>
          <div>{this.arbitageAlert()}</div>
        </div>
        {this.props.loaded &&
          this.props.binance.buy[0] && (
            <div className="exchangeUnitContainer">
              <img className="exchangeLogo" src={binanceLogo} />
              <div className="marketInfoContainer">
                <MarketDepth
                  chartData={this.formatChartData("binanceBuy")}
                  chartSellData={this.formatChartData("binanceSell")}
                />
                {this.props.binance.candlesticks[0] && (
                  <Candlestick data={this.props.binance.candlesticks} />
                )}
              </div>
            </div>
          )}
        {this.props.loaded &&
          this.props.bittrex.buy[0] && (
            <div className="exchangeUnitContainer">
              <img className="exchangeLogo" src={bittrexLogo} />
              <div className="marketInfoContainer">
                <MarketDepth
                  chartData={this.formatChartData("bittrexBuy")}
                  chartSellData={this.formatChartData("bittrexSell")}
                />
                {this.props.bittrex.candlesticks[0] && (
                  <Candlestick data={this.props.bittrex.candlesticks} />
                )}
              </div>
            </div>
          )}
        {this.props.loaded &&
          this.props.cryptopia.buy[0] && (
            <div className="exchangeUnitContainer">
              <img className="excangeLogo" src={cryptopiaLogo} />
              <div className="marketInfoContainer">
                <MarketDepth
                  chartData={this.formatChartData("cryptopiaBuy")}
                  chartSellData={this.formatChartData("cryptopiaSell")}
                />

                {this.props.cryptopia.candlesticks[0] && (
                  <Candlestick data={this.props.cryptopia.candlesticks} />
                )}
              </div>
            </div>
          )}
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Market);
