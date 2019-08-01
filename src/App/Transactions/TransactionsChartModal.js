import React from 'react';
import { connect } from 'react-redux';
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryTooltip,
  createContainer,
} from 'victory';

import Modal from 'components/Modal';

import { getChartData, getFilteredTransactions } from './selectors';

const returnCorrectFillColor = inData =>
  inData.category == 'credit'
    ? '#0ca4fb'
    : inData.category == 'debit'
    ? '#035'
    : '#fff';

const returnCorrectStokeColor = inData =>
  inData.category == 'credit'
    ? '#0ca4fb'
    : inData.category == 'debit'
    ? '#035'
    : '#fff';

const categoryText = inData => {
  switch (inData.category) {
    case 'credit':
    case 'receive':
      return __('Receive');
    case 'debit':
    case 'send':
      return __('Sent');
    case 'genesis':
      return __('Genesis');
    case 'trust':
      return __('Trust');
    case 'generate':
      return __('Generate');
    case 'immature':
      return __('Immature');
    case 'stake':
      return __('Stake');
    case 'orphan':
      return __('Orphan');
    default:
      return __('Unknown');
  }
};

const TransactionsChartModal = ({ theme, chartData }) => {
  const { theme, chartData } = this.props;
  const chartData = this.returnChartData();
  const VictoryZoomVoronoiContainer = createContainer('voronoi', 'zoom');

  return (
    <Modal>
      <Modal.Body>
        <VictoryChart
          width={550}
          height={150}
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
                fill: d => returnCorrectFillColor(d),
                stroke: d => returnCorrectStokeColor(d),
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
            labels={inData =>
              `${categoryText(inData)}\n` +
              `${__('Amount')}: ${inData.b}\n` +
              `${__('Time')}: ${inData.a}`
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
      </Modal.Body>
    </Modal>
  );
};

const mapStateToProps = ({
  theme,
  transactions,
  ui: {
    transactions: { account, addressQuery, category, minAmount, timeSpan },
  },
}) => ({
  theme,
  chartData: getChartData(
    getFilteredTransactions(
      transactions,
      account,
      addressQuery,
      category,
      minAmount,
      timeSpan
    )
  ),
});

export default connect(mapStateToProps)(TransactionsChartModal);
