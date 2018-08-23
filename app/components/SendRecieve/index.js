import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { connect } from "react-redux";
import * as RPC from "../../script/rpc";

import * as TYPE from "../../actions/actiontypes";

import ContextMenuBuilder from "../../contextmenu";
import { remote } from "electron";
import { access } from "fs";

// import images here
import sendimg from "../../images/send.svg";

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
  AccountPicked: returnSelectedAccount => {
    dispatch({ type: TYPE.SELECTED_ACCOUNT, payload: returnSelectedAccount });
  },
  changeAccount: returnAccountChanger => {
    dispatch({ type: TYPE.CHANGE_ACCOUNT, payload: returnAccountChanger });
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
    RPC.PROMISE("listaccounts").then(payload => {
      this.props.changeAccount(
        Object.entries(payload).map(e => {
          return {
            name: e[0],
            val: e[1]
          };
        })
      );
    });
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

  editQueue() {
    if (Object.keys(this.props.Queue).includes(this.props.Address)) {
      return (
        <button
          className="button large"
          onClick={() => {
            if (confirm("Edit Entry?")) this.validateAddToQueue();
          }}
        >
          Edit Entry
        </button>
      );
    } else {
      return (
        <button
          name="Add To Queue"
          className="button large"
          onClick={() => this.validateAddToQueue()}
        >
          Add To Queue
        </button>
      );
    }
  }

  nxsAmount(e) {
    if (/^[0-9.]+$/.test(e.target.value) | (e.target.value === "")) {
      this.props.updateAmount(e.target.value);
    } else {
      return null;
    }
  }

  accHud() {
    if (this.props.SelectedAccount === "") {
      return " My Account";
    } else {
      return this.props.SelectedAccount;
    }
  }

  accountChanger() {
    if (this.props.AccountChanger[1]) {
      return this.props.AccountChanger.map(e => {
        if (e.name === "") {
          return (
            <option key={e.name} value={e.name}>
              My Account : {e.val}
              NXS
            </option>
          );
        } else {
          return (
            <option key={e.name} value={e.name}>
              {e.name}: {e.val}
              NXS
            </option>
          );
        }
      });
    } else {
      return null;
    }
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
                  parseFloat(this.props.Amount),
                  this.props.Message
                ]);
                this.props.clearForm();
                this.props.busy();
              } else {
                RPC.PROMISE("sendtoaddress", [
                  this.props.Address,
                  parseFloat(this.props.Amount)
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
      RPC.PROMISE("sendmany", [this.props.SelectedAccount, this.props.Queue]);
    } else {
      RPC.PROMISE("sendtoaddress", [
        keyCheck[1],
        Object.values(this.props.Queue)[0]
      ]).then(payoad => console.log(payload));
    }
    this.props.clearForm();
    this.props.busy();
    this.props.clearQueue();
  }

  addAmount() {
    let keyCheck = Object.keys(this.props.Queue);
    if (keyCheck.length > 0) {
      let sum = Object.values(this.props.Queue).reduce((acc, val) => {
        return acc + val;
      });
      return (
        <div id="summary">
          TOTAL: {sum.toFixed(5)} NXS
          <p>FEE: {this.props.paytxfee.toFixed(5)} NXS </p>
          FROM: {this.accHud(this.props.SelectedAccount)}
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
                amount: parseFloat(this.props.Amount)
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
          <td className="td">{e.val.toFixed(8)}</td>
          <td className="td">
            <img
              id="Remove"
              src="images/status-bad.svg"
              disabled={this.props.busyFlag}
              onClick={() => {
                if (confirm("Delete Entry?")) this.props.removeQueue(e.key);
              }}
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
      <div id="sendrecieve" className="animated fadeIn">
        <h2><img src={sendimg} className="hdr-img"/>Send Nexus</h2>
        <div className="panel">
          <div id="container">
            <div className="box1">
              <div className="field">
                <select
                  id="select"
                  onChange={e => this.props.AccountPicked(e.target.value)}
                >
                  {this.accountChanger()}
                </select>
                <p>
                  <label>Nexus Address</label>
                  <input
                    size="35"
                    type="text"
                    placeholder="Enter NXS Address"
                    value={this.props.Address}
                    onChange={e => this.props.updateAddress(e.target.value)}
                    required
                  />{" "}
                </p>

                <p>
                  <span className="hint">Amount Of Nexus</span>
                  <label>Nexus Amount</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="Nexus Amount"
                    value={this.props.Amount}
                    onChange={e => this.nxsAmount(e)}
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
                  {this.editQueue()}
                  <input
                    type="reset"
                    value="Send Now"
                    className="button"
                    onClick={() => {
                      if (confirm("Send NXS?")) this.sendOne();
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="box2">
              <div id="table-wraper">
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
                    onClick={() => {
                      if (confirm("Send All Transactions?"))
                        console.log(this.sendMany());
                    }}
                  />
                  <input
                    type="button"
                    value="Clear Queue"
                    className="button primary"
                    onClick={() => {
                      if (confirm("Clear All?")) this.props.clearQueue();
                    }}
                  />
                  <p>
                    <div className="counter">{this.addAmount()} </div>
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
