import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";

import NetworkGlobe from "../Overview/NetworkGlobe";

export default class Market extends Component {
  render() {
    return (
      <div>
        <h1>Market</h1>
        <NetworkGlobe />
      </div>
    );
  }
}
