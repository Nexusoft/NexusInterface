import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Request from "request";

import styles from "./style.css";
import * as TYPE from "../../actions/actiontypes";
import LineChart from "../Chart/Line.js";
import MarketDepth from "../Chart/MarketDepth";

// import images
import bittrexLogo from "../../images/BittrexLogo.png";
import binanceLogo from "../../images/BINANCE.png";
import cryptopiaLogo from "../../images/cryptopia.png";
import * as actionsCreators from "../../actions/marketActionCreators";

const mapStateToProps = state => {
  return { ...state.market };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(actionsCreators, dispatch);

class Market extends Component {
  // thunk API calls to the exchanges
  componentDidMount() {
    this.props.binanceDepthLoader();
    this.props.bittrexDepthLoader();
    this.props.cryptopiaDepthLoader();
    this.props.binance24hrInfo();
    this.props.bittrex24hrInfo();
    this.props.cryptopia24hrInfo();
  }

  formatBuyData(array) {
    let newQuantity = 0;
    let prevQuantity = 0;
    let finnishedArray = array
      .map(e => {
        newQuantity = prevQuantity + e.Volume;
        prevQuantity = newQuantity;
        if (e.Price < array[0].Price * 0.05) {
          console.log("low Price Cutoff");
          return {
            x: 0,
            y: newQuantity
          };
        } else {
          return {
            x: e.Price,
            y: newQuantity
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
        <h1>Market</h1>

        {this.props.loaded &&
          this.props.binance.buy[0] && (
            <div className="exchangeUnitContainer">
              <img className="exchangeLogo" src={binanceLogo} />
              <div className="marketInfoContainer">
                <MarketDepth
                  chartData={this.formatChartData("binanceBuy")}
                  chartSellData={this.formatChartData("binanceSell")}
                />
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
