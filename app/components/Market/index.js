import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Request from "request";

import styles from "./style.css";
import * as TYPE from "../../actions/actiontypes";
import LineChart from "../Chart/Line.js";

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

  getOptions() {
    return {
      legend: {
        labels: { fontColor: "#ffffff" },
        position: "bottom"
      },
      scales: {
        yAxes: [
          {
            type: "linear",
            scaleLabel: {
              display: true,
              labelString: "NXS Volume",
              fontColor: "#ffffff"
            },
            ticks: {
              fontColor: "#ffffff"
            }
          }
        ],
        xAxes: [
          {
            type: "linear",
            scaleLabel: {
              display: true,
              labelString: "BTC Price",
              fontColor: "#ffffff"
            },
            ticks: {
              stepSize: 0.00001,
              beginAtZero: false,
              fontColor: "#ffffff"
            }
          }
        ]
      }
    };
  }

  formatBuyData(array) {
    let newQuantity = 0;
    let prevQuantity = 0;
    let finnishedArray = array.map(e => {
      newQuantity = prevQuantity + e.Volume;
      prevQuantity = newQuantity;
      if (e.Price < array[0].Price * 0.05) {
        console.log("low Price Cutoff");
        return {};
      } else {
        return {
          x: e.Price,
          y: newQuantity
        };
      }
    });
    return finnishedArray;
  }

  formatChartData(exchange) {
    const dataSetArray = [];
    switch (exchange) {
      case "binance":
        dataSetArray.push({
          label: "Binance Buy Volume",
          steppedLine: true,
          data: [...this.formatBuyData(this.props.binance.buy)],
          backgroundColor: ["rgba(48, 104, 24, 0.7)"],
          borderColor: ["rgba(48, 104, 24, 1)"],
          borderWidth: 1
        });
        dataSetArray.push({
          label: "Binance Sell Volume",
          steppedLine: true,
          data: [...this.formatBuyData([...this.props.binance.sell].reverse())],
          backgroundColor: ["rgba(143,0,0, 0.7)"],
          borderColor: ["rgba(128,0,0,1)"],
          borderWidth: 1
        });
        break;
      case "bittrex":
        dataSetArray.push({
          label: "Bittrex Buy Volume",
          steppedLine: true,
          data: [...this.formatBuyData(this.props.bittrex.buy)],
          backgroundColor: ["rgba(48, 104, 24, 0.7)"],
          borderColor: ["rgba(48, 104, 24, 1)"],
          borderWidth: 1
        });
        dataSetArray.push({
          label: "Bittrex Sell Volume",
          steppedLine: true,
          data: [...this.formatBuyData([...this.props.bittrex.sell].reverse())],
          backgroundColor: ["rgba(143,0,0, 0.7)"],
          borderColor: ["rgba(128,0,0,1)"],
          borderWidth: 1
        });
        break;
      case "cryptopia":
        dataSetArray.push({
          label: "Cryptopia Buy Volume",
          steppedLine: true,
          data: [...this.formatBuyData(this.props.cryptopia.buy)],
          backgroundColor: ["rgba(48, 104, 24, 0.7)"],
          borderColor: ["rgba(48, 104, 24, 1)"],
          borderWidth: 1
        });
        dataSetArray.push({
          label: "Cryptopia Sell Volume",
          steppedLine: true,
          data: [
            ...this.formatBuyData([...this.props.cryptopia.sell].reverse())
          ],
          backgroundColor: ["rgba(143,0,0, 0.7)"],
          borderColor: ["rgba(128,0,0,1)"],
          borderWidth: 1
        });
        break;
      default:
        return {};
        break;
    }

    return {
      labels: [],
      datasets: dataSetArray
    };
  }

  render() {
    return (
      <div id="Market">
        <h1>Market</h1>{" "}
        {this.props.loaded &&
          this.props.binance.buy[0] && (
            <div className="marketInfoContainer">
              <img src={binanceLogo} />
              <LineChart
                chartData={this.formatChartData("binance")}
                options={this.getOptions()}
              />
              <LineChart
                chartData={this.formatChartData("binance")}
                options={this.getOptions()}
              />
            </div>
          )}
        {this.props.loaded &&
          this.props.bittrex.buy[0] && (
            <div className="marketInfoContainer">
              <img src={bittrexLogo} />
              <LineChart
                chartData={this.formatChartData("bittrex")}
                options={this.getOptions()}
              />
              <LineChart
                chartData={this.formatChartData("binance")}
                options={this.getOptions()}
              />
            </div>
          )}
        {this.props.loaded &&
          this.props.cryptopia.buy[0] && (
            <div className="marketInfoContainer">
              <img src={cryptopiaLogo} />
              <LineChart
                chartData={this.formatChartData("cryptopia")}
                options={this.getOptions()}
              />
              <LineChart
                chartData={this.formatChartData("binance")}
                options={this.getOptions()}
              />
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
