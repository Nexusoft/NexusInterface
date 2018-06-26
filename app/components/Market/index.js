import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import Request from "request";

export default class Market extends Component {
  componentDidMount() {
    this.requester();
  }
  requester() {
    Request(
      {
        url: "https://www.cryptopia.co.nz/api/GetMarket/NXS_BTC",
        json: true
      },
      (error, response, body) => {
        if (response.statusCode === 200) {
          var res = body.Data;
          console.log(res);
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
          var res = body.Data;
          console.log(res);
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
          var res = body.result[0];
          console.log(res);
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
          var res = body.result;
          console.log(res);
        }
      }
    );
  }
  render() {
    return (
      <div>
        <h1>Market</h1>
      </div>
    );
  }
}
