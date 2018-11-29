import React, { Component } from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import { FormattedMessage } from "react-intl";
import messages from "../Language/messages";

export default class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {
      indata: this.props.data,
      incolumns: this.props.columns,
      selected: null,
      selectedcallback: this.props.selectCallback,
      onMouseOverCallback: this.props.onMouseOverCallback,
      onMouseOutCallback: this.props.onMouseOutCallback
    };
  }

  ReturnTableRows() {
    let rows = [];
    for (let index = 0; index < 5; index++) {
      rows.push(
        <tr key={index} id={"row" + index}>
          <td key={"item1-" + index}>{"ROW " + index}</td>
          <td key={"item2-" + index}>{"ROW " + index}</td>
        </tr>
      );
    }
    return rows;
  }

  render() {
    const data = this.props.data;
    const columns = this.props.columns;
    const minRows = this.props.minRows;
    let defaultsorting = [];
    if (this.props.defaultsortingid !== null) {
      defaultsorting = [
        {
          id: columns[this.props.defaultsortingid].accessor,
          desc: true
        }
      ];
    }

    return (
      <FormattedMessage id="transactions.Rows" defaultMessage="Rows">
        {R => (
          <ReactTable
            noDataText={
              <FormattedMessage
                id="transactions.NoRowsFound"
                defaultMessage="No Rows Found"
              />
            }
            key="table-child"
            data={data}
            pageText={
              <FormattedMessage id="transactions.Page" defaultMessage="Page" />
            }
            columns={columns}
            minRows={minRows}
            defaultSorted={defaultsorting}
            defaultPageSize={10}
            rowsText={R}
            previousText={
              <FormattedMessage
                id="transactions.Previous"
                defaultMessage="Previous"
              />
            }
            nextText={
              <FormattedMessage id="transactions.Next" defaultMessage="Next" />
            }
            getTrProps={(state, rowInfo) => {
              return {
                onClick: e => {
                  this.props.onMouseOverCallback(e, rowInfo);
                  this.props.selectCallback(e, rowInfo);
                  this.setState({
                    selected: rowInfo.index
                  });
                },
                onContextMenu: e => {
                  this.props.selectCallback(e, rowInfo);
                },
                onMouseDown: e => {
                  this.props.onMouseOverCallback(e, rowInfo);
                },
                onMouseOver: e => {
                  this.props.onMouseOverCallback(e, rowInfo);
                },
                onMouseOut: e => {
                  this.props.onMouseOutCallback(e);
                }
                // style: {
                //     background: rowInfo.index === this.state.selected ? '#00afec' : 'white',
                //     color: rowInfo.index === this.state.selected ? 'white' : 'black'
                // }
              };
            }}
            style={{
              height: "400px"
            }}
          />
        )}
      </FormattedMessage>
    );

    /*
        return(
            <div id="table-div">
                <table id="table" className='table'>
                    <thread>
                        <tr>
                         <th key={"COL1"}>{"ONE"}</th>
                         <th key={"COL2"}>{"TWO"}</th>
                       </tr>
                    </thread>
                    <tbody>
                        {this.ReturnTableRows()}
                    </tbody>
                </table>
            </div>
        );
        */
  }
}
