import React, { Component } from "react";
import { connect } from "react-redux";
import styles from "./style.css";
import * as RPC from "../../script/rpc";
import * as TYPE from "../../actiontypes";

const mapStateToProps = state => {
  return { ...state.listReducer };
};

const mapDispatchToProps = dispatch => ({
  GetListDump: returnedData =>
    dispatch({ type: TYPE.GET_TRUST_LIST, payload: returnedData }),
  ToggleSortDir: () => dispatch({ type: TYPE.TOGGLE_SORT_DIRECTION })
});

class List extends Component {
  componentDidMount() {
    RPC.PROMISE("getnetworktrustkeys", []).then(payload => {
      this.props.GetListDump(payload.keys);
      console.log(this.props);
    });
    console.log(this.props);
  }

  buildList() {
    console.log(this.props);

    if (this.props.trustlist) {
      let sortableList = [...this.props.trustlist];
      if (this.props.acc) {
        sortableList = sortableList.sort(
          (a, b) => b["interest rate"] - a["interest rate"]
        );
      } else {
        sortableList = sortableList.sort(
          (a, b) => a["interest rate"] - b["interest rate"]
        );
      }
      return sortableList.map(ele => (
        <tr key={ele.address.slice(0, 8)} className="ListItem">
          <td key={ele.address.slice(0, 9)}>{ele.address}</td>
          <td key={ele.address.slice(0, 10)} className="intrestRate">
            {ele["interest rate"]}
          </td>
        </tr>
      ));
    }
  }

  render() {
    return (
      <div id="listRoot">
        <h1>Trust List</h1>

        <table id="listbody">
          <thead id="listhead">
            <th>
              <div>Address</div>
            </th>
            <th onClick={() => this.props.ToggleSortDir()}>
              <div>Intrest Rate</div>
            </th>
          </thead>
          <tbody id="tablebody">{this.buildList()}</tbody>
        </table>
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(List);
