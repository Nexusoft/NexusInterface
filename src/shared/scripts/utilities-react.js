import React, { Component } from 'react';
import ReactTable from 'react-table';
import Text from 'components/Text';

/**
 * Table for the transaction page
 *
 * @export Table Returns Table Component
 * @class Table
 * @extends {Component}
 */
export default class Table extends Component {
  /**
   *Creates an instance of Table.
   * @param {*} props
   * @memberof Table
   */
  constructor(props) {
    super(props);
    this.state = {
      indata: this.props.data,
      incolumns: this.props.columns,
      selected: null,
      selectedcallback: this.props.selectCallback,
      onMouseOverCallback: this.props.onMouseOverCallback,
      onMouseOutCallback: this.props.onMouseOutCallback,
    };
  }

  /**
   * Component's Renderable JSX
   *
   * @returns {JSX}
   * @memberof Table
   */
  render() {
    const data = this.props.data;
    const columns = this.props.columns;
    const minRows = this.props.minRows;
    let defaultsorting = [];
    if (this.props.defaultsortingid !== null) {
      defaultsorting = [
        {
          id: columns[this.props.defaultsortingid].accessor,
          desc: true,
        },
      ];
    }
    return (
      <ReactTable
        className="-striped -highlight"
        noDataText={_('No Rows Found')}
        key="ReactTable"
        data={data}
        pageText={_('Page')}
        columns={columns}
        minRows={minRows}
        defaultSorted={defaultsorting}
        defaultPageSize={10}
        rowsText={_('Rows')}
        previousText={_('Previous')}
        nextText={_('Next')}
        getTrProps={(state, rowInfo) => {
          return {
            onClick: e => {
              this.props.onMouseOverCallback(e, rowInfo);
              this.props.selectCallback(e, rowInfo);
              this.setState({
                selected: rowInfo.index,
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
            },
          };
        }}
        style={{
          overscrollBehavior: 'contain',
          height: '400px',
          '--colorPrimary': this.props.style.background,
          '--colorAccent': this.props.style.primary,
          '--colorSecondary': this.props.style.foreground,
        }}
      />
    );
  }
}
