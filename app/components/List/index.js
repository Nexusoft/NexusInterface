import React, { Component } from "react";
import { connect } from "react-redux";
import styles from "./style.css";
import * as RPC from "../../script/rpc";
import * as TYPE from "../../actions/actiontypes";

const mapStateToProps = state => {
  return { ...state.list };
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
    });

  }

  buildList() {

    if (this.props.trustlist) {

      let sortableList = [...this.props.trustlist];

      if (this.props.acc) {
        sortableList = sortableList.sort(
          (a, b) => b["interest rate"] - a["interest rate"]
        );
      } 
      else {
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

      <div id="trustlist">

        <div id="trustlist-container">

	        <h2>Trust List</h2>

	        <div className="panel">
            <div id="table-wrap">
            <table id="listbody" className="table table-striped table-hover user-list fixed-header">

              <thead id="listhead">

                <th>
                  <div>Address</div>
                </th>

                <th onClick={() => this.props.ToggleSortDir()}>
                  <div>Interest Rate</div>
                </th>

              </thead>

              <tbody id="tablebody">{this.buildList()}</tbody>

            </table>
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
)(List);
