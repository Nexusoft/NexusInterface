import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import styles from "./style.css";

const mapStateToProps = state => {
  // console.log(state.common);
  return {
    ...state.common,
    ...state.login
  };
};

const mapDispatchToProps = dispatch => ({
  setDate: date => dispatch({ type: TYPE.SET_DATE, payload: date }),
  setPassword: password =>
    dispatch({ type: TYPE.SET_PASSWORD, payload: password }),
  wipe: () => dispatch({ type: TYPE.WIPE_LOGIN_INFO }),
  busy: () => dispatch({ type: TYPE.TOGGLE_BUSY_FLAG })
});

class Security extends Component {
  componentDidMount() {
    console.log(`${this.props.match.path}`);
  }
  render() {
    if (!this.props.loggedIn) {
      return (
        <Redirect to={this.props.match.path.replace("/Content", "/Security")} />
      );
    }
    return (
      <div id="securitylogin">
        <h1>hey look this is the other one</h1>
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Security);
