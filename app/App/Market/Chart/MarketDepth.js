/*
Title: MarkaetDepth
Description: Handle how to draw graph for market depth
Last Modified by: Brian Smith
*/
// External Dependencies
import React, { Component } from 'react';
import Text, { translate } from 'components/Text';
import {
  VictoryArea,
  VictoryChart,
  VictoryTooltip,
  VictoryAnimation,
  VictoryAxis,
  VictoryPortal,
  VictoryLabel,
  VictoryVoronoiContainer,
} from 'victory';

/**
 * Creates a Victory Chart that displays the market depth
 *
 * @export
 * @class MarketDepth
 * @extends {Component}
 */
export default class MarketDepth extends Component {
  // Mandatory React method
  /**
   * React Render
   *
   * @returns
   * @memberof MarketDepth
   */
  render() {
    return (
      <div className="marketDepthInner">
        <VictoryChart
          theme={{
            axis: {
              style: {
                axis: {
                  fill: 'this.props.theme.foreground',
                  strokeWidth: 1,
                },
                axisLabel: {
                  fill: 'this.props.theme.foreground',
                  padding: 35,
                  fontSize: 14,
                },
                grid: {
                  fill: 'none',
                  stroke: 'none',
                  pointerEvents: 'painted',
                },
                ticks: {
                  fill: 'this.props.theme.foreground',
                  size: 5,
                  stroke: 'this.props.theme.foreground',
                },
                tickLabels: {
                  padding: 1,
                  fill: 'this.props.theme.foreground',
                  fontSize: 10,
                },
              },
            },
          }}
          containerComponent={<VictoryVoronoiContainer />}
        >
          <VictoryAxis
            label={translate('Market.Volume', this.props.locale)}
            dependentAxis
            tickFormat={tick => {
              if (tick % 1000000 === 0) {
                return `${tick / 1000}M`;
              } else if (tick % 1000 === 0) {
                return `${tick / 1000}K`;
              } else {
                return tick;
              }
            }}
          />

          <VictoryArea
            style={{
              data: {
                fill: 'url(#green)',
              },
            }}
            labelComponent={
              <VictoryTooltip
                orientation={index => {
                  if (
                    [...this.props.chartData].findIndex(e => {
                      if (e.x === index.x) {
                        return e;
                      }
                    }) >
                    [...this.props.chartData].length / 2
                  ) {
                    return 'right';
                  } else return 'top';
                }}
              />
            }
            data={[...this.props.chartData]}
          />
          <VictoryArea
            style={{
              data: {
                fill: 'url(#red)',
              },
            }}
            labelComponent={
              <VictoryTooltip
                orientation={index => {
                  if (
                    [...this.props.chartSellData].findIndex(e => {
                      if (e.x === index.x) {
                        return e;
                      }
                    }) >
                    [...this.props.chartSellData].length / 2
                  ) {
                    return 'left';
                  } else return 'top';
                }}
              />
            }
            data={[...this.props.chartSellData]}
          />
          <VictoryAxis
            label={translate('Market.Price', this.props.locale)}
            independentAxis
            style={{ tickLabels: { angle: -15 } }}
            tickLabelComponent={
              <VictoryPortal>
                <VictoryLabel />
              </VictoryPortal>
            }
          />
        </VictoryChart>
        <svg style={{ height: 0 }}>
          <defs>
            <linearGradient id="green" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(38, 230, 0, 0.9)" />
              <stop offset="100%" stopColor=" rgba(38, 230, 0, 0.2)" />
            </linearGradient>
          </defs>
        </svg>
        <svg style={{ height: 0 }}>
          <defs>
            <linearGradient id="red" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(255, 15, 15,0.9)" />
              <stop offset="100%" stopColor=" rgba(255, 15, 15,0.2)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }
}
