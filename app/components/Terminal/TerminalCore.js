/*
  Title: Terminal Core
  Description: show what methods have been called to the rpc server
  Last Modified by: Brian Smith
*/
// External Dependencies
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { timingSafeEqual } from "crypto";
import { connect } from "react-redux";

// Internal Dependencies
import styles from "./style.css";
import * as RPC from "../../script/rpc";
import * as TYPE from "../../actions/actiontypes";

// React-Redux mandatory methods
const mapStateToProps = state => {
  return { ...state.terminal, ...state.common };
};
//const mapDispatchToProps = dispatch => {};

class TerminalCore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deamonoutput: ["Started in Manual Deamon Mode"]
    };
  }
  // React Method (Life cycle hook)
  componentDidUpdate(prevProps) {
    //if (this.props.rpcCallList.length != prevProps.rpcCallList.length) {
    // this.forceUpdate();
    //}
  }

  // React Method (Life cycle hook)
  componentWillReceiveProps(nextProps) {
    if (this.props.rpcCallList.length != nextProps.rpcCallList.length) {
      this.forceUpdate();
    }
  }

  // Class Methods
  processDeamonOutput() {
    let num = 0;
    return this.props.rpcCallList.map(i => {
      num++;
      return <div key={"Deamonout_" + num}>{i}</div>;
    });
  }

  // Mandatory React method
  render() {
    return <div id="terminal-core-output">{this.processDeamonOutput()}</div>;
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps
//  mapDispatchToProps
)(TerminalCore);
