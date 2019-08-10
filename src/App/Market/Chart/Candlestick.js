/*
Title: Candlestick
Description: Handle how to draw candle sticks
Last Modified by: Brian Smith
*/

// External Dependencies
import React, { Component } from 'react';
import styled from '@emotion/styled';
import {
  VictoryChart,
  VictoryAxis,
  VictoryCandlestick,
  VictoryPortal,
  VictoryLabel,
  VictoryTooltip,
} from 'victory';

const MarketDepthInner = styled.div({
  position: 'relative',
  flex: 1,
  minHeight: 300,
  maxWidth: '50%',
  marginLeft: 5,
});
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
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Candlestick
   */
  render() {
    return (
      <MarketDepthInner>
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
            label={__('Date')}
            style={{ color: '#000', padding: 10 }}
            tickFormat={t =>
              `${new Date(t).toLocaleDateString(this.props.locale, {
                month: 'short',
                day: 'numeric',
              })}`
            }
            tickLabelComponent={
              <VictoryPortal>
                <VictoryLabel />
              </VictoryPortal>
            }
          />

          <VictoryAxis
            label={__('Price')}
            dependentAxis
            style={{ tickLabels: { angle: -60 }, axisLabel: { padding: 35 } }}
          />

          <VictoryCandlestick
            style={{ data: { stroke: this.props.theme.foreground } }}
            candleColors={{
              positive: 'rgba(38, 230, 0, 1)',
              negative: 'rgba(255, 15, 15, 1)',
            }}
            data={this.props.data}
            labelComponent={
              <VictoryTooltip
                orientation={index => {
                  if (
                    [...this.props.data].findIndex(e => {
                      if (e.x === index.x) {
                        return e;
                      }
                    }) >
                    [...this.props.data].length / 2
                  ) {
                    return 'right';
                  } else return 'left';
                }}
              />
            }
          />
        </VictoryChart>
      </MarketDepthInner>
    );
  }
}
