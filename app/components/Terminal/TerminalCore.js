import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { timingSafeEqual } from "crypto";
import * as RPC from "../../script/rpc";

export default class TerminalCore extends Component {

  constructor(props){
    super(props);
    this.state = {

      deamonoutput: ["Started in Manual Deamon Mode"]
      
    }

  }  

  processDeamonOutput()
  {
    let num = 0;
    return this.state.deamonoutput.map((i) =>
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
