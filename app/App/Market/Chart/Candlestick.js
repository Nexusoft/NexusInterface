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

import styled from '@emotion/styled';
const TerminalCoreComponent = styled.div(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  border: `1px solid ${theme.mixer(0.125)}`,
}));

const asdas = styled()


/**
 * Creates a Victory Chart that uses CandleSticks
 *
 * @export
 * @class Candlestick
 * @extends {Component}
 */
export default class Candlestick extends Component {
  // Mandatory React method

  /**
   * React Render
   *
   * @returns
   * @memberof Candlestick
   */
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
                  stroke: this.props.theme.foreground,
                  strokeWidth: 1,
                },
                axisLabel: {
                  stroke: 'transparent',
                  fontweight: 'normal',
                  fill: this.props.theme.foreground,
                  padding: 35,
                  fontSize: 14,
                },
                grid: {
                  fill: 'none',
                  stroke: 'none',
                  padding: 10,
                  pointerEvents: 'painted',
                },
                ticks: {
                  fill: this.props.theme.foreground,
                  size: 5,
                  padding: 1,
                  stroke: this.props.theme.foreground,
                },
                tickLabels: {
                  fontSize: 10,
                  padding: 2,
                  fill: this.props.theme.foreground,
                  stroke: 'transparent',
                },
              },
            },
          }}
        >
          <VictoryAxis
            label={translate('Market.Date', this.props.locale)}
            style={{color:'#000', padding: 10}}
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
            style={{ tickLabels: { angle: -60 } , axisLabel: { padding :35}}}
          />

          <VictoryCandlestick
            style={{ data: { stroke: this.props.theme.foreground } }}
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
