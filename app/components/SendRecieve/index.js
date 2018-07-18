import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { connect } from "react-redux";

const mapStateToProps = state => {
  return { ...state.common };
};

const mapDispatchToProps = dispatch => ({});

class SendRecieve extends Component {
  render() {
    return (
      <div id="send-receive">
        <div id="send-receive-container">
          <h2>Send / Receive</h2>

          <div className="panel" />
        </div>
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SendRecieve);
