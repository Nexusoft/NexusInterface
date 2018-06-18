import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

import styles from "./style.css";
import * as RPC from "../../script/rpc";
import * as TYPE from "../../actiontypes";

const mapStateToProps = state => ({
  ...state.common
});

const mapDispatchToProps = dispatch => ({
  GetInfoDump: returnedData =>
    dispatch({ type: TYPE.GET_INFO_DUMP, payload: returnedData })
});

class Header extends Component {
  componentWillMount() {
    RPC.PROMISE("getinfo", []).then(payload => {
      this.props.GetInfoDump(payload);
      console.log(this.props);
    });

    var self = this;
    self.set = setInterval(function() {
      RPC.PROMISE("getinfo", []).then(payload => {
        self.props.GetInfoDump(payload);
      });
    }, 1000);
  }

  render() {
    return (
      <div id="Header">
        <div id="settings-menu">{this.props.timestamp}</div>

        <Link to="/">
          <img src="images/NXS-logo-min.png" alt="Nexus Logo" id="test" />
        </Link>

        <div id="hdr-line" />
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
