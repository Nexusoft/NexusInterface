import React, { Component } from "react";
import { connect } from "react-redux";
import Immutable from "immutable";
import styles from "./style.css";
import * as RPC from "../../script/rpc";
import * as TYPE from "../../actiontypes";

const mapStateToProps = state => {
  return state.get("listReducer").toJS();
};

const mapDispatchToProps = dispatch => ({
  GetListDump: returnedData =>
    dispatch({ type: TYPE.GET_TRUST_LIST, payload: returnedData })
});

class List extends Component {
  componentDidMount() {
    RPC.PROMISE("getnetworktrustkeys", []).then(payload =>
      this.props.GetListDump(payload.keys)
    );
    console.log(this.props);
  }

  render() {
    return (
      <div>
        <h1>List</h1>
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(List);
