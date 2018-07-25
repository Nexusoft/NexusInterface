import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { connect } from "react-redux";
import * as TYPE from "../../actions/actiontypes";

const mapStateToProps = state => {
  return { ...state.common, ...state.transactions };
};

const mapDispatchToProps = dispatch => ({
  SetExploreInfo: returnData => {
    dispatch({ type: TYPE.SET_TRANSACTION_EXPLOREINFO, payload: returnData });
  }
});

class BlockExplorer extends Component {
  render() {
    if (this.props.exploreinfo != undefined && this.props.exploreinfo != null) {
      console.log(this.props.exploreinfo);
      this.props.SetExploreInfo(null);
    }

    return (
      <div id="blockexplorer">
        <h2>Block Explorer</h2>

        <div className="panel" />
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BlockExplorer);
