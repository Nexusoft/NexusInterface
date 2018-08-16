import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { connect } from "react-redux";
import * as RPC from "../../script/rpc";

import * as TYPE from "../../actions/actiontypes";

import ContextMenuBuilder from "../../contextmenu";
import { remote } from "electron";
import { access } from "fs";

const mapStateToProps = state => {
  return {
    ...state.common,
    ...state.transactions,
    ...state.sendRecieve,
    ...state.overview
  };
};

const mapDispatchToProps = dispatch => ({
  SetSendAgainData: returnData => {
    dispatch({ type: TYPE.SET_TRANSACTION_SENDAGAIN, payload: returnData });
  },
  updateAddress: returnAddress => {
    dispatch({ type: TYPE.UPDATE_ADDRESS, payload: returnAddress });
  },
  clearQueue: () => {
    dispatch({ type: TYPE.CLEAR_QUEUE });
  },
  clearForm: () => {
    dispatch({ type: TYPE.CLEAR_FORM });
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
  },
  busy: () => dispatch({ type: TYPE.TOGGLE_BUSY_FLAG })
});

class SendRecieve extends Component {
  componentDidMount() {
    window.addEventListener("contextmenu", this.setupcontextmenu, false);

    this.props.googleanalytics.SendScreen("Send");
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

  sendOne() {
    this.props.busy();
    if (!(this.props.Address === "") && this.props.Amount > 0) {
      RPC.PROMISE("validateaddress", [this.props.Address])
        .then(payload => {
          if (payload.isvalid) {
            if (!payload.ismine) {
              if (this.props.Message) {
                RPC.PROMISE("sendtoaddress", [
                  this.props.Address,
                  this.props.Amount,
                  Message
                ]);
                this.props.clearForm();
                this.props.busy();
              } else {
                RPC.PROMISE("sendtoaddress", [
                  this.props.Address,
                  this.props.Amount
                ]).then(payoad => console.log(payload));
                this.props.clearForm();
                this.props.busy();
              }
            } else {
              this.props.busy();
              alert("This is an address regiestered to this wallet");
            }
          } else {
            this.props.busy();
            alert("Invalid Address");
          }
        })
        .catch(e => {
          this.props.busy();
          alert("Invalid Address");
        });
    }
  }

  sendMany() {
    let keyCheck = Object.keys(this.props.Queue);
    this.props.busy();

    if (keyCheck.length > 1) {
      RPC.PROMISE("sendmany", ["", this.props.Queue]);
    } else {
      RPC.PROMISE("sendtoaddress", [
        keyCheck[1],
        Object.values(this.props.Queue)[0]
      ]).then(payoad => console.log(payload));
      this.props.clearForm();
      this.props.busy();
    }
  }
  addAmount() {
    let keyCheck = Object.keys(this.props.Queue);
    if (keyCheck.length > 0) {
      let sum = Object.values(this.props.Queue).reduce((acc, val) => {
        return acc + val;
      });
      return (
        <div id="feeCounter">
          {" "}
          TOTAL: {sum} NXS
          <p>FEE: {this.props.paytxfee} NXS </p>{" "}
        </div>
      );
    }
  }

  validateAddToQueue() {
    this.props.busy();
    if (!(this.props.Address === "") && this.props.Amount > 0) {
      console.log(this.props.Address);
      RPC.PROMISE("validateaddress", [this.props.Address])
        .then(payload => {
          console.log(payload);
          if (payload.isvalid) {
            if (!payload.ismine) {
              this.props.addToQueue({
                address: this.props.Address,
                amount: this.props.Amount
              });
              this.props.busy();
            } else {
              this.props.busy();
              alert("This is an address regiestered to this wallet");
            }
          } else {
            this.props.busy();
            alert("Invalid Address");
          }
        })
        .catch(e => {
          this.props.busy();
          alert("Invalid Address");
        });
    }
  }

  fillQueue() {
    let Keys = Object.keys(this.props.Queue);
    let values = Object.values(this.props.Queue);
    let queueArray = Keys.map((e, i) => {
      let newObj = {
        key: e,
        val: values[i]
      };
      console.log(newObj);
      return newObj;
    });

    console.log(Keys, values, queueArray);
    return queueArray.map((e, i) => {
      return (
        <tr key={i}>
          <td className="td">{e.key}</td>
          <td className="td">{e.val}</td>
          <td className="td">
            <img
              id="Remove"
              src="images/status-bad.svg"
              disabled={this.props.busyFlag}
              onClick={() => this.props.removeQueue(e.key)}
            />
          </td>
        </tr>
      );
    });
  }

  render() {
    ///THIS IS NOT THE RIGHT AREA, this is for auto completing when you press a transaction
    if (this.props.sendagain != undefined && this.props.sendagain != null) {
      console.log(this.props.sendagain);
      this.props.SetSendAgainData(null);
    }
    return (
      <div id="sendrecieve">
        <h2>Send Nexus</h2>
        <div className="panel">
          <div id="container">
            <div className="box1">
              {" "}
              <div className="field">
                <label>Nexus Address</label>
                <input
                  size="35"
                  type="text"
                  placeholder="Enter NXS Address"
                  value={this.props.Address}
                  onChange={e => this.props.updateAddress(e.target.value)}
                  required
                />
                <p>
                  <span className="hint">Amount Of Nexus</span>
                  <label>Nexus Amount</label>
                  <input
                    step="0.00000001"
                    className="input"
                    type="number"
                    placeholder="Nexus Amount"
                    value={this.props.Amount}
                    onChange={e => {
                      this.props.updateAmount(
                        parseFloat(e.target.value).toFixed(8)
                      );
                    }}
                    required
                  />
                </p>
                <p>
                  <label>Message</label>
                  <textarea
                    value={this.props.Message}
                    onChange={e => this.props.updateMessage(e.target.value)}
                    name="message"
                    rows="5"
                    cols="36"
                    placeholder="Enter Your Message"
                  />
                </p>
                <div id="left-buttons">
                  <input
                    type="button"
                    value="Add To Queue"
                    className="button primary"
                    onClick={() => this.validateAddToQueue()}
                    disabled={this.props.busyFlag}
                  />

                  <input
                    type="reset"
                    value="Send Now"
                    className="button"
                    onClick={() => this.sendOne()}
                    disabled={this.props.busyFlag}
                  />
                </div>
              </div>
            </div>
            <div className="box2">
              {" "}
              <div id="table-wraper">
                {" "}
                <p>
                  <label className="label">Queue</label>
                </p>
                <table className="table">
                  <thead className="thead">
                    <th>Address</th>
                    <th>Amount</th>
                    <th>Remove</th>
                  </thead>
                  <tr />
                  {this.fillQueue()}
                  <tbody className="tbody"> </tbody>
                </table>
                <foot className="foot">
                  <input
                    type="reset"
                    value="Send All"
                    className="button primary"
                    disabled={this.props.busyFlag}
                    onClick={() => {
                      this.sendMany();
                    }}
                  />
                  <input
                    type="button"
                    value="Clear Queue"
                    className="button primary"
                    disabled={this.props.busyFlag}
                    onClick={() => {
                      this.props.clearQueue();
                    }}
                  />{" "}
                  <p>
                    <div className="counter">{this.addAmount()}</div>{" "}
                  </p>
                </foot>{" "}
              </div>{" "}
            </div>
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
