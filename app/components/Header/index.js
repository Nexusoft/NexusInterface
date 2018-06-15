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
    console.log(this.props);
    RPC.PROMISE("getinfo", []).then(payload => {
      console.log(payload);
      this.props.GetInfoDump(payload);
    });
  }
  //
  render() {
    return (
      <div id="Header">
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
