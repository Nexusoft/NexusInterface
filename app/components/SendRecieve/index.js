import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { connect } from "react-redux";
import * as RPC from "../../script/rpc";

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
                RPC.PROMISE(
                  "sendtoaddress",
                  this.props.address,
                  this.props.amount,
                  [Message]
                );
                this.props.clearForm();
                this.props.busy();
              } else {
                RPC.PROMISE(
                  "sendtoaddress",
                  this.props.address,
                  this.props.amount
                );
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
    this.props.busy();
    RPC.PROMISE("sendmany", this.props.Queue).then(this.props.busy());
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
          <td>{e.key}</td>
          <td>{e.val}</td>
          <button onClick={() => this.props.removeQueue(e.key)}>Hoe </button>
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

                  <span className="hint">Amount Of Nexus</span>
                  <label>Nexus Amount</label>
                  <input
                    size="27"
                    type="number"
                    placeholder="Nexus Amount"
                    value={this.props.Amount}
                    onChange={e => {
                      this.props.updateAmount(parseFloat(e.target.value));
                    }}
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
                  onClick={() => this.validateAddToQueue()}
                />

                <input
                  type="reset"
                  value="Send Now"
                  className="button"
                  onClick={() => this.sendOne()}
                />
              </div>
            </div>
          </div>

          <div className="box2">
            {" "}
            <label>Queue </label>
            <table>
              <thead>
                <th> Address</th>
                <th>Amount</th>
              </thead>
              <tbody>{this.fillQueue()}</tbody>
            </table>
            <div id="right-buttons">
              <input type="reset" value="Send All" className="button" />
              <input
                type="button"
                value="Clear Queue"
                className="button primary"
                onClick={() => {
                  this.props.clearQueue();
                }}
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
