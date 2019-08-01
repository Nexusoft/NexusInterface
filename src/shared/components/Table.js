import React from 'react';
import ReactTable from 'react-table';

const Table = ({
  data,
  columns,
  minRows,
  defaultSortingColumnIndex,
  onMouseOverCallback,
  selectCallback,
  onMouseOutCallback,
}) => (
  <ReactTable
    className="-striped -highlight"
    noDataText={__('No Rows Found')}
    key="ReactTable"
    data={data}
    pageText={__('Page')}
    columns={columns}
    minRows={minRows}
    defaultSorted={
      defaultSortingColumnIndex !== null
        ? [
            {
              id: columns[defaultSortingColumnIndex].accessor,
              desc: true,
            },
          ]
        : []
    }
    defaultPageSize={10}
    rowsText={__('rows')}
    previousText={__('Previous')}
    nextText={__('Next')}
    getTrProps={(state, rowInfo) => {
      return {
        onClick: e => {
          onMouseOverCallback(e, rowInfo);
          selectCallback(e, rowInfo);
          this.setState({
            selected: rowInfo.index,
          });
        },
        onContextMenu: e => {
          selectCallback(e, rowInfo);
        },
        onMouseDown: e => {
          onMouseOverCallback(e, rowInfo);
        },
        onMouseOver: e => {
          onMouseOverCallback(e, rowInfo);
        },
        onMouseOut: e => {
          onMouseOutCallback(e);
        },
      };
    }}
  />
);

export default Table;
