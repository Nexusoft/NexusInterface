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
        <h2>Address Book</h2>

        <div className="panel" />
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Addressbook);
