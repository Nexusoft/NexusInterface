import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { connect } from "react-redux";

const mapStateToProps = state => {
  return { ...state.common };
};

const mapDispatchToProps = dispatch => ({});
class BlockExplorer extends Component {
  render() {
    return (
      <div id="blockexplorer">
        <div id="blockexplorer-container">
          <h2>Block Explorer</h2>

          <div className="panel" />
        </div>
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BlockExplorer);
