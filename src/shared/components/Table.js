import React from 'react';
import ReactTable from 'react-table';

const Table = ({
  data,
  columns,
  defaultSortingColumnIndex,
  onMouseOverCallback,
  selectCallback,
  onMouseOutCallback,
  ...rest
}) => (
  <ReactTable
    className="-striped -highlight"
    noDataText={__('No Rows Found')}
    data={data}
    pageText={__('Page')}
    columns={columns}
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
    rowsText={__('rows')}
    previousText={__('Previous')}
    nextText={__('Next')}
    // getTrProps={(state, rowInfo) => {
    //   return {
    //     onClick: e => {
    //       onMouseOverCallback(e, rowInfo);
    //       selectCallback(e, rowInfo);
    //       this.setState({
    //         selected: rowInfo.index,
    //       });
    //     },
    //     onContextMenu: e => {
    //       selectCallback(e, rowInfo);
    //     },
    //     onMouseDown: e => {
    //       onMouseOverCallback(e, rowInfo);
    //     },
    //     onMouseOver: e => {
    //       onMouseOverCallback(e, rowInfo);
    //     },
    //     onMouseOut: e => {
    //       onMouseOutCallback(e);
    //     },
    //   };
    // }}
    {...rest}
  />
);

export default Table;
