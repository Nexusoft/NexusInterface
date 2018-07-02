import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import Request from "request";

import styles from "./style.css";
import * as TYPE from "../../actiontypes";
import LineChart from "../Chart/Line.js";

import bittrexLogo from "../../images/BittrexLogo.png";
import binanceLogo from "../../images/BINANCE.png";
import cryptopiaLogo from "../../images/cryptopia.png";
// import actionsCreators from "./marketThunkRequester";

const mapStateToProps = state => {
  return { ...state.market };
};

// const mapDispatchToProps = dispatch => ({
//   ...actionsCreators
// });

const mapDispatchToProps = dispatch => ({
  cryptopia24: returnedData =>
    dispatch({ type: TYPE.CRYPTOPIA_24, payload: returnedData }),
  bittrex24: returnedData =>
    dispatch({ type: TYPE.BITTREX_24, payload: returnedData }),
  binance24: returnedData =>
    dispatch({ type: TYPE.BINANCE_24, payload: returnedData }),
  cryptopiaOB: returnedData =>
    dispatch({ type: TYPE.CRYPTOPIA_ORDERBOOK, payload: returnedData }),
  bittrexOB: returnedData =>
    dispatch({ type: TYPE.BITTREX_ORDERBOOK, payload: returnedData }),
  binanceOB: returnedData =>
    dispatch({ type: TYPE.BINANCE_ORDERBOOK, payload: returnedData }),
  marketDataLoaded: () => dispatch({ type: TYPE.MARKET_DATA_LOADED })
});

class Market extends Component {
  componentDidMount() {
    // console.log(this.props);
    this.requester();
  }

  requester() {
    Request(
      {
        url: "https://api.binance.com/api/v1/depth?symbol=NXSBTC",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          let res = {
            sell: body.asks
              .map(ele => {
                return {
                  Volume: parseFloat(ele[1]),
                  Price: parseFloat(ele[0])
                };
              })
              .sort((a, b) => b.Price - a.Price),
            buy: body.bids
              .map(ele => {
                return {
                  Volume: parseFloat(ele[1]),
                  Price: parseFloat(ele[0])
                };
              })
              .sort((a, b) => b.Price - a.Price)
          };

          this.props.binanceOB(res);
          this.props.marketDataLoaded();
        }
      }
    );
    Request(
      {
        url: "https://api.binance.com/api/v1/ticker/24hr?symbol=NXSBTC",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          this.props.binance24(body);
        }
      }
    );
    Request(
      {
        url: "https://www.cryptopia.co.nz/api/GetMarket/NXS_BTC",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          this.props.cryptopia24(body.Data);
        }
      }
    );
    Request(
      {
        url: "https://www.cryptopia.co.nz/api/GetMarketOrders/NXS_BTC",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          let res = {
            buy: body.Data.Buy.sort((a, b) => b.Price - a.Price).map(e => {
              return { Volume: e.Volume, Price: e.Price };
            }),
            sell: body.Data.Sell.sort((a, b) => b.Price - a.Price).map(e => {
              return { Volume: e.Volume, Price: e.Price };
            })
          };
          this.props.cryptopiaOB(res);
        }
      }
    );
    Request(
      {
        url:
          "https://bittrex.com/api/v1.1/public/getmarketsummary?market=btc-nxs",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          this.props.bittrex24(body.result[0]);
        }
      }
    );
    Request(
      {
        url:
          "https://bittrex.com/api/v1.1/public/getorderbook?market=BTC-NXS&type=both",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          let res = {
            buy: body.result.buy.sort((a, b) => b.Rate - a.Rate).map(e => {
              return { Volume: e.Quantity, Price: e.Rate };
            }),
            sell: body.result.sell.sort((a, b) => b.Rate - a.Rate).map(e => {
              return { Volume: e.Quantity, Price: e.Rate };
            })
          };
          this.props.bittrexOB(res);
        }
      }
    );
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
      // console.log(array[0].Price * 0.001);
      // console.log(e.Price);
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
    // console.log(finnishedArray);
    return finnishedArray;
  }

  formatChartData() {
    const dataSetArray = [];
    // dataSetArray.push({
    //   label: "Cryptopia Buy Volume",
    //   steppedLine: true,
    //   data: [...this.formatBuyData(this.props.cryptopia.buy)],
    //   backgroundColor: ["rgba(106, 199, 0, 0.7)"],
    //   borderColor: ["rgba(106,199,0,1)"],
    //   borderWidth: 1
    // });
    // dataSetArray.push({
    //   label: "Cryptopia Sell Volume",
    //   steppedLine: true,
    //   data: [...this.formatBuyData([...this.props.cryptopia.sell].reverse())],
    //   backgroundColor: ["rgba(220,0,0, 0.7)"],
    //   borderColor: ["rgba(220,0,0,1)"],
    //   borderWidth: 1
    // });
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
    // dataSetArray.push({
    //   label: "Binance Buy Volume",
    //   steppedLine: true,
    //   data: [...this.formatBuyData(this.props.binance.buy)],
    //   backgroundColor: ["rgba(48, 104, 24, 0.7)"],
    //   borderColor: ["rgba(48, 104, 24, 1)"],
    //   borderWidth: 1
    // });
    // dataSetArray.push({
    //   label: "Binance Sell Volume",
    //   steppedLine: true,
    //   data: [...this.formatBuyData([...this.props.binance.sell].reverse())],
    //   backgroundColor: ["rgba(143,0,0, 0.7)"],
    //   borderColor: ["rgba(128,0,0,1)"],
    //   borderWidth: 1
    // });
    // console.log([
    //   ...this.formatBuyData([...this.props.binance.sell].reverse())
    // ]);

    return {
      labels: [],
      datasets: dataSetArray
    };
  }

  render() {
    return (
      <div id="Market">
        <h1>Market</h1>
        {this.props.loaded && (
          <div className="marketInfoContainer">
            <img src={bittrexLogo} />
            <LineChart
              chartData={this.formatChartData()}
              options={this.getOptions()}
            />
            <LineChart
              chartData={this.formatChartData()}
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
