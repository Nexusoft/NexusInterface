import { useSelector } from 'react-redux';
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryTooltip,
  createContainer,
} from 'victory';

import ControlledModal from 'components/ControlledModal';

import {
  getChartData,
  getFilteredTransactions,
  getTransactionsList,
} from './selectors';
import { categoryText } from './utils';

__ = __context('Transactions.TransactionsChart');

const VictoryZoomVoronoiContainer = createContainer('voronoi', 'zoom');

const barFillColor = (inData) =>
  inData.category == 'credit'
    ? '#0ca4fb'
    : inData.category == 'debit'
    ? '#035'
    : '#fff';

const barStrokeColor = (inData) =>
  inData.category == 'credit'
    ? '#0ca4fb'
    : inData.category == 'debit'
    ? '#035'
    : '#fff';

export default function TransactionsChartModal() {
  const theme = useSelector((state) => state.theme);
  const chartData = useSelector(
    ({
      transactions,
      ui: {
        transactions: { account, addressQuery, category, minAmount, timeSpan },
      },
    }) =>
      getChartData(
        getFilteredTransactions(
          getTransactionsList(transactions.map),
          account,
          addressQuery,
          category,
          minAmount,
          timeSpan
        )
      )
  );

  return (
    <ControlledModal>
      <ControlledModal.Header>
        {__('Transactions chart')}
      </ControlledModal.Header>
      <ControlledModal.Body style={{ paddingTop: 50, paddingBottom: 50 }}>
        <VictoryChart
          width={550}
          height={200}
          scale={{ x: 'time' }}
          style={
            {
              // overflow: 'visible',
              // border: '1px solid ' + this.props.theme.primary,
            }
          }
          domainPadding={{ x: 90, y: 30 }}
          padding={{
            top: 6,
            bottom: 6,
            left: 30,
            right: 0,
          }}
          // domain={this.state.zoomDomain}
          containerComponent={
            <VictoryZoomVoronoiContainer
              voronoiPadding={10}
              zoomDimension="x"
              // zoomDomain={this.state.zoomDomain}
              // onZoomDomainChange={this.handleZoom.bind(this)}
            />
          }
        >
          <VictoryBar
            style={{
              data: {
                fill: (d) => barFillColor(d),
                stroke: (d) => barStrokeColor(d),
                fillOpacity: 0.85,
                strokeWidth: 1,
                fontSize: 3000,
              },
            }}
            labelComponent={
              <VictoryTooltip
              // orientation={incomingProp => {
              //   let internalDifference =
              //     this.state.zoomDomain.x[1].getTime() -
              //     this.state.zoomDomain.x[0].getTime();
              //   internalDifference = internalDifference / 2;
              //   internalDifference =
              //     this.state.zoomDomain.x[0].getTime() + internalDifference;
              //   if (incomingProp.a.getTime() <= internalDifference) {
              //     return 'right';
              //   } else {
              //     return 'left';
              //   }
              // }}
              />
            }
            labels={({ datum }) =>
              `${categoryText(datum.category)}\n` +
              `${__('Amount')}: ${datum.b}\n` +
              `${__('Time')}: ${datum.a}`
            }
            data={chartData}
            x="a"
            y="b"
          />

          <VictoryAxis
            // label="Time"
            independentAxis
            style={{
              axis: { stroke: theme.primary, strokeOpacity: 1 },
              axisLabel: { fontSize: 16 },
              grid: {
                stroke: theme.primary,
                strokeOpacity: 0.25,
              },
              ticks: {
                stroke: theme.primary,
                strokeOpacity: 0.75,
                size: 10,
              },
              tickLabels: { fontSize: 11, padding: 5, fill: '#bbb' },
            }}
          />

          <VictoryAxis
            // label="Amount"
            dependentAxis
            style={{
              axis: { stroke: theme.primary, strokeOpacity: 1 },
              axisLabel: { fontSize: 16 },
              grid: {
                stroke: theme.primary,
                strokeOpacity: 0.25,
              },
              ticks: {
                stroke: theme.primary,
                strokeOpacity: 0.75,
                size: 10,
              },
              tickLabels: { fontSize: 11, padding: 5, fill: '#bbb' },
            }}
          />
        </VictoryChart>
      </ControlledModal.Body>
    </ControlledModal>
  );
}
