import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { connect } from "react-redux";

const mapStateToProps = state => {
  return { ...state.common };
};

const mapDispatchToProps = dispatch => ({});

class Addressbook extends Component {
  render() {
    return (
      <div id="addressbook">
        <div id="addressbook-container">
          <h2>Address Book</h2>

          <div className="panel" />
        </div>
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Addressbook);
