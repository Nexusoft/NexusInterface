// @flow
import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";

import * as RPC from "../../script/rpc";

export default class Header extends Component {
  componentWillMount() {
    RPC.PROMISE("getinfo", []).then(payload => console.log(payload));
  }
  //
  render() {
    return (
      <div id="Header">
        <h1>Header goes here.</h1>
      </div>
    );
  }
}
