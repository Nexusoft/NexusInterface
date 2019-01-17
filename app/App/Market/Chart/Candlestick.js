/*
Title: Candlestick
Description: Handle how to draw candle sticks
Last Modified by: Brian Smith
*/

// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Text, { translate } from 'components/Text';
import {
  VictoryChart,
  VictoryAxis,
  VictoryCandlestick,
  VictoryPortal,
  VictoryLabel,
  VictoryTooltip,
} from 'victory';

export default class Candlestick extends Component {
  // Mandatory React method

  render() {
    return (
      <div className="marketDepthInner">
        <VictoryChart
          domainPadding={{ x: 10 }}
          theme={{
            axis: {
              style: {
                axis: {
                  fill: 'transparent',
                  stroke: 'white',
                  strokeWidth: 1,
                },
                axisLabel: {
                  stroke: 'white',
                  fontweight: 'normal',

                  padding: 40,
                  fontSize: 10,
                },

                grid: {
                  fill: 'none',
                  stroke: 'none',
                  pointerEvents: 'painted',
                },
                ticks: {
                  fill: 'white',
                  size: 5,
                  stroke: 'white',
                },
                tickLabels: {
                  fontSize: 10,
                  padding: 1,
                  fill: 'white',
                  stroke: 'transparent',
                },
              },
            },
          }}
        >
          <VictoryAxis
            label={translate('Market.Date', this.props.locale)}
            tickFormat={t =>
              `${new Date(t).toLocaleDateString(this.props.locale,{month:"short", day:"numeric"})}`
            }
            tickLabelComponent={
              <VictoryPortal>
                <VictoryLabel />
              </VictoryPortal>
            }
          />

          <VictoryAxis
            label={translate('Market.Price', this.props.locale)}
            dependentAxis
            style={{ tickLabels: { angle: -45 } }}
          />

          <VictoryCandlestick
            style={{ data: { stroke: 'white' } }}
            candleColors={{
              positive: 'rgba(38, 230, 0, 1)',
              negative: 'rgba(255, 15, 15, 1)',
            }}
            data={this.props.data}
            labelComponent={<VictoryTooltip />}
          />
        </VictoryChart>
      </div>
    );
  }
}
