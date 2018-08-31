import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { connect } from "react-redux";
import * as TYPE from "../../actions/actiontypes";

import ContextMenuBuilder from "../../contextmenu";
import {remote} from "electron";

import blockexplorerimg from "../../images/blockexplorer.svg";


const mapStateToProps = state => {
  return { ...state.common, ...state.transactions };
};

const mapDispatchToProps = dispatch => ({
  SetExploreInfo: returnData => {
    dispatch({ type: TYPE.SET_TRANSACTION_EXPLOREINFO, payload: returnData });
  }
});

class BlockExplorer extends Component {


  componentDidMount()
  {
    window.addEventListener("contextmenu", this.setupcontextmenu, false);
  }

  componentWillUnmount()
  {
    window.removeEventListener("contextmenu",this.setupcontextmenu);
  }

  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  render() {
    if (this.props.exploreinfo != undefined && this.props.exploreinfo != null) {
      console.log(this.props.exploreinfo);
      this.props.SetExploreInfo(null);
    }

    return (
      <div id="blockexplorer" className="animated fadeIn">
        <h2><img src={blockexplorerimg} />Block Explorer</h2>

        <div className="panel" />
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BlockExplorer);
