import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { connect } from "react-redux";

import * as TYPE from "../../actions/actiontypes";

import ContextMenuBuilder from "../../contextmenu";
import { remote } from "electron";

const mapStateToProps = state => {
  return { ...state.common, ...state.transactions, ...state.sendRecieve };
};

const mapDispatchToProps = dispatch => ({
  SetSendAgainData: returnData => {
    dispatch({ type: TYPE.SET_TRANSACTION_SENDAGAIN, payload: returnData });
  },
  updateAddress: returnAddress => {
    dispatch({ type: TYPE.UPDATE_ADDRESS, payload: returnAddress });
  },
  addToQueue: returnQueue => {
    dispatch({ type: TYPE.ADD_TO_QUEUE, payload: returnQueue });
  },
  updateAmount: returnAmount => {
    dispatch({ type: TYPE.UPDATE_AMOUNT, payload: returnAmount });
  },
  updateMessage: returnMessage => {
    dispatch({ type: TYPE.UPDATE_MESSAGE, payload: returnMessage });
  },
  updateAccount: returnAccount => {
    dispatch({ type: TYPE.UPDATE_ACCOUNT_NAME, payload: returnAccount });
  },
  removeQueue: returnQueue => {
    dispatch({ type: TYPE.REMOVE_FROM_QUEUE, payload: returnQueue });
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
  fillQueue() {
    let queueArray = [];
    if ((this.props.Address, this.props.Amount)) {
      queueArray.push(Object.keys(this.props.queueArray));
    }
    return queueArray;
  }

  render() {
    ///THIS IS NOT THE RIGHT AREA, this is for auto completing when you press a transaction
    if (this.props.sendagain != undefined && this.props.sendagain != null) {
      console.log(this.props.sendagain);
      this.props.SetSendAgainData(null);
    }
    return (
      <div className="panel">
        <div>
          <h2 className="h">Send Nexus </h2>
        </div>
        <div id="container">
          <div>
            {" "}
            <div>
              <div className="box">
                <legend>Create</legend>
                <div className="field">
                  <label>Nexus Address</label>
                  <input
                    size="27"
                    type="text"
                    placeholder="Enter NXS Address"
                    value={this.props.Address}
                    onChange={e => this.props.updateAddress(e.target.value)}
                    required
                  />
                  <span className="hint">NXS Account Name</span>
                  <label>Nexus Account Name</label>
                  <input
                    size="27"
                    type="text"
                    placeholder="NXS Account Name"
                    value={this.props.Account}
                    onChange={e => this.props.updateAccount(e.target.value)}
                    required
                  />
                  <span className="hint">Amount Of Nexus</span>
                  <label>Nexus Amount</label>
                  <input
                    size="27"
                    type="text"
                    placeholder="Nexus Amount"
                    value={this.props.Amount}
                    onChange={e => this.props.updateAmount(e.target.value)}
                    required
                  />
                  <p>
                    <textarea
                      value={this.props.Message}
                      onChange={e => this.props.updateMessage(e.target.value)}
                      name="message"
                      rows="5"
                      cols="28"
                      placeholder="Enter Your Message"
                    />
                  </p>
                </div>
              </div>
              <div id="left-buttons">
                <input
                  type="button"
                  value="Add To Queue"
                  className="button primary"
                  onClick={() =>
                    console.log(this.props.Address, this.props.Amount)
                  }
                />
                <input type="reset" value="Send Now" className="button" />
              </div>
            </div>
          </div>

          <div className="box2">
            {" "}
            <label>Queue </label>
            <table>
              <tbody>
                <tr>
                  <th> Account</th>
                  <th> Address</th>
                  <th>Amount</th>
                </tr>

                <tr>
                  <td> {this.props.Account} </td>
                  <td> {this.props.Address} </td>
                  <td> {this.props.Amount} </td>
                </tr>
              </tbody>
            </table>
            <div id="right-buttons">
              <input type="button" value="-Remove" className="button primary" />
              <input type="reset" value="Send Now" className="button" />
              <input
                type="button"
                value="Clear All"
                className="button primary"
              />
            </div>{" "}
          </div>
        </div>
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SendRecieve);
