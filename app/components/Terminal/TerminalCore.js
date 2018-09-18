import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { timingSafeEqual } from "crypto";
import * as RPC from "../../script/rpc";
import * as TYPE from "../../actions/actiontypes";
import { connect } from "react-redux";


const mapStateToProps = state => {
  return { ...state.terminal, ...state.common };
};

const mapDispatchToProps = dispatch => (
  {}
);

class TerminalCore extends Component {

  constructor(props){
    super(props);
    this.state = {

      deamonoutput: ["Started in Manual Deamon Mode"]
      
    }

  }  
  
  componentDidUpdate(prevProps)
  {
    //if (this.props.rpcCallList.length != prevProps.rpcCallList.length) {
     // this.forceUpdate();
    //}
  }

  componentWillReceiveProps(nextProps)
  {
    if (this.props.rpcCallList.length != nextProps.rpcCallList.length) {
      this.forceUpdate();
    }
  }

  processDeamonOutput()
  {
    let num = 0;
    return this.props.rpcCallList.map((i) =>
    {
      num++;
      return (
        <div key= {'Deamonout_' + num}>
        {i}
        </div>
      )
    });
  }

  render() {
    return (
      <div id="terminal-core-output">
        {this.processDeamonOutput()}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TerminalCore);
