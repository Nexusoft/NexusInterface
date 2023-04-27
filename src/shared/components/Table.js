import ReactTable from 'react-table';

export default function Table({
  data,
  columns,
  defaultSortingColumnIndex,
  ...rest
}) {
  return (
    <ReactTable
      noDataText={__('No Rows Found')}
      data={data}
      pageText={__('Page')}
      columns={columns}
      defaultSorted={[{ ...columns[defaultSortingColumnIndex], desc: true }]}
      rowsText={__('rows')}
      previousText={'< ' + __('Previous')}
      nextText={__('Next') + ' >'}
      {...rest}
      className={`-striped -highlight ${rest.className}`}
    />
  );
}
