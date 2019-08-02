import React from 'react';
import ReactTable from 'react-table';

const Table = ({ data, columns, defaultSortingColumnIndex, ...rest }) => (
  <ReactTable
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
    previousText={'< ' + __('Previous')}
    nextText={__('Next') + ' >'}
    {...rest}
    className={`-striped -highlight ${rest.className}`}
  />
);

export default Table;
