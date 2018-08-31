import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { Route, Redirect } from "react-router";
import { connect } from "react-redux";
import Modal from "react-responsive-modal";
import { Link } from "react-router-dom";
import Request from "request";
import Countdown from "react-countdown-now";

import styles from "./style.css";
import Fast from "./Fast";
import Precise from "./Precise";
import * as RPC from "../../script/rpc";
import * as TYPE from "../../actions/actiontypes";
import bullseye from "../../images/bullseye.svg";
import fastImg from "../../images/fast.svg";

import ContextMenuBuilder from "../../contextmenu";
import { remote } from "electron";

// import images here
import shapeshiftimg from "../../images/shapeshift.svg";

const mapStateToProps = state => {
  return {
    ...state.common,
    ...state.exchange
  };
};

const mapDispatchToProps = dispatch => ({
  clearTransaction: () => {
    dispatch({ type: TYPE.CLEAR_TRANSACTION });
  },
  emailForRecipt: email => {
    dispatch({ type: TYPE.SET_EMAIL, payload: email });
  }
});

class Exchange extends Component {
  componentDidMount() {
    this.props.googleanalytics.SendScreen("Exchange");
    window.addEventListener("contextmenu", this.setupcontextmenu, false);
    var settings = require("../../api/settings.js");
    var settingsObj = settings.GetSettings();
    if (settingsObj.email) {
      this.props.emailForRecipt(settingsObj.email);
    }
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

  modalContents() {
    if (this.props.transaction.expiration) {
      console.log(this.props.transaction.expiration);
      return (
        <div>
          <h2>All right, let's get to it!</h2>
          Now all you have to do is send {
            this.props.transaction.depositAmount
          }{" "}
          {this.props.from} to:
          <br />
          {this.props.transaction.depositAddress}
          <br />
          before the timer runs out and your <br />
          {this.props.transaction.depositAmount} {this.props.from} will be
          shifted at {this.props.transaction.quotedRate} {this.props.to}/
          {this.props.from} to
          <br />
          {this.props.transaction.withdrawalAmount} {this.props.to}
          <br /> <br />
          QUOTE EXPIRES IN:
          <br />
          <Countdown
            date={Date.now() + (this.props.transaction.expiration - Date.now())}
            onComplete={() => this.props.clearTransaction()}
            renderer={({ hours, minutes, seconds, completed }) => {
              if (completed) {
                alert("Transaction Expired");
                return null;
              } else {
                return (
                  <span>
                    {minutes}:{seconds}
                  </span>
                );
              }
            }}
          />
          <br /> <br />
          {/* <button
            className="button primary"
            onClick={() => this.cancelTransaction()}
          >
            Cancel Transaction
          </button> */}
        </div>
      );
    } else {
      return (
        <div>
          <h2>
            Awesome, <br /> Transaction initiated!
          </h2>
          Now all you have to do is send {this.props.ammount}{" "}
          {this.props.transaction.depositType} to:
          <br />
          {this.props.transaction.depositAddress}
          <br />
          and your {this.props.transaction.withdrawalType} will be on its way!
          <br />
          <br />
          P.S. <br /> Here's your order id:
          <br />
          {this.props.transaction.orderId}
          <br />
          Hold on to it, you might need it.
          <br />
          <br />
          {/* {this.props.email !== "" ? (
            <button
              className="button primary"
              onClick={() => this.requestRecipt()}
            >
              Email Receipt?
            </button>
          ) : (
            <div>
              Set your Email in <Link to="/Settings">Settings</Link> to recieve
              email receipts.
            </div>
          )}
          <button
            className="button primary"
            onClick={() => this.cancelTransaction()}
          >
            Cancel Transaction
          </button> */}
        </div>
      );
    }
  }

  // cancelTransaction() {
  //   console.log("cancel");

  //   Request(
  //     {
  //       method: "POST",
  //       url: "https://shapeshift.io/cancelpending",
  //       json: {
  //         address: this.props.transaction.depositAddress
  //       }
  //     },
  //     (error, response, body) => {
  //       console.log(response);
  //       if (response.statusCode === 200) {
  //         if (!response.body.error) {
  //           console.log(response);
  //         }
  //       } else {
  //         console.log(response);
  //       }
  //     }
  //   );
  // }

  // requestRecipt() {
  //   console.log("email", this.props.email);
  //   Request(
  //     {
  //       method: "POST",
  //       url: "https://shapeshift.io/mail",
  //       json: {
  //         email: this.props.email,
  //         orderId: this.props.transaction.orderId
  //       }
  //     },
  //     (error, response, body) => {
  //       if (response.statusCode === 200) {
  //         if (!response.body.error) {
  //           console.log(response);
  //         }
  //       } else {
  //         console.log(response);
  //       }
  //     }
  //   );
  // }

  render() {
    // Redirect to application settings if the pathname matches the url (eg: /Settings = /Settings)
    if (this.props.location.pathname === this.props.match.url) {
      console.log("Redirecting to Precise trading");

      return <Redirect to={`${this.props.match.url}/Precise`} />;
    }

    return (
      <div id="Exchange" className="animated fadeIn">
        <Modal
          open={this.props.transactionModalFlag}
          onClose={this.props.clearTransaction}
          center
          classNames={{ modal: "modal" }}
        >
          {this.modalContents()}
        </Modal>

        <div id="Exchange-container">
          <div>
            <h2><img src={shapeshiftimg} className="hdr-img"/>Exchange</h2>
            <p>powered by ShapeShift</p>
          </div>
          <div className="panel">
            <ul className="tabs">
              <li>
                <NavLink to={`${this.props.match.url}/Precise`}>
                  <img src={bullseye} alt="Precise" />
                  Precise
                </NavLink>
              </li>
              <li>
                <NavLink to={`${this.props.match.url}/Fast`}>
                  <img src={fastImg} alt="Fast" />
                  Fast
                </NavLink>
              </li>
            </ul>

            <div className="grid-container">
              <Route
                exact
                path={`${this.props.match.path}/`}
                render={() => <Precise />}
              />
              <Route
                path={`${this.props.match.path}/Precise`}
                render={props => <Precise />}
              />
              <Route
                path={`${this.props.match.path}/Fast`}
                render={() => <Fast />}
              />
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
)(Exchange);
