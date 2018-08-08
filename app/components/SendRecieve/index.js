import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { connect } from "react-redux";
import * as RPC from "../../script/rpc";

import * as TYPE from "../../actions/actiontypes";

import ContextMenuBuilder from "../../contextmenu";
import { remote } from "electron";

// const testParams = {
//   ["2SGFyEHg3tm7Ska6z6G9aWyyu3QBqEJT5pyUeG5gf88JMuc6ZQv"]: 0.25,
//   ["2RLNjiVGcAoHBNvBbLBTb85Ls6J55eja2yhcemtHJF3swaPAfpG"]: 0.25
// };

const mapStateToProps = state => {
  return { ...state.common, ...state.transactions };
};

const mapDispatchToProps = dispatch => ({
  SetSendAgainData: returnData => {
    dispatch({ type: TYPE.SET_TRANSACTION_SENDAGAIN, payload: returnData });
  }
});

class SendRecieve extends Component {
  componentDidMount() {
    window.addEventListener("contextmenu", this.setupcontextmenu, false);
  }

  componentWillUnmount() {
    window.removeEventListener("contextmenu", this.setupcontextmenu);
  }

  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  render() {
    ///THIS IS NOT THE RIGHT AREA, this is for auto completing when you press a transaction
    if (this.props.sendagain != undefined && this.props.sendagain != null) {
      console.log(this.props.sendagain);
      this.props.SetSendAgainData(null);
    }

    return (
      <div id="send-receive">
        <h2>Send / Receive</h2>
        <button
          onClick={() => {
            RPC.PROMISE("sendmany", [
              "",
              {
                ["2SGFyEHg3tm7Ska6z6G9aWyyu3QBqEJT5pyUeG5gf88JMuc6ZQv"]: 10.25,
                ["2RLNjiVGcAoHBNvBbLBTb85Ls6J55eja2yhcemtHJF3swaPAfpG"]: 10.25
              }
            ]).catch(e => console.log(e.error.message));
          }}
        >
          Test
        </button>
        <div className="panel" />
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SendRecieve);
