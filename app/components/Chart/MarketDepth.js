import React, { Component } from "react";
import {
  VictoryArea,
  VictoryChart,
  VictoryTooltip,
  VictoryAnimation
} from "victory";

export default class MarketDepth extends Component {
  constructor(props) {
    super(props);
    this.state = {
      crosshairValues: {},
      buySeries: true
    };

    this._onMouseLeave = this._onMouseLeave.bind(this);
    this._onNearestX = this._onNearestX.bind(this);
    this._onNearestXbuy = this._onNearestXbuy.bind(this);
  }

  /**
   * Event handler for onNearestX.
   * @param {Object} value Selected value.
   * @param {index} index Index of the value in the data array.
   * @private
   */
  _onNearestX(value, { index }) {
    if (!this.state.buySeries) {
      this.setState({ crosshairValues: value });
    }
  }
  _onNearestXbuy(value, { index }) {
    if (this.state.buySeries) {
      this.setState({ crosshairValues: value });
    }
  }
  /**
   * Event handler for onMouseLeave.
   * @private
   */
  _onMouseLeave() {
    this.setState({ crosshairValues: {} });
  }

  whichseries(bool) {
    if (bool) {
      this.setState({ buySeries: true });
    } else {
      this.setState({ buySeries: false });
    }
  }

  render() {
    return (
      <div className="marketDepthInner">
        {/* <div className="infobox">
          {this.state.buySeries ? "Buy" : "Sell"}
          <br />
          BTC Price: {this.state.crosshairValues.x} <br />
          NXS Volume: {this.state.crosshairValues.y}
        </div> */}
        <VictoryChart
          animate={{
            duration: 1000,
            onLoad: { duration: 1000 }
          }}
          theme={{
            axis: {
              style: {
                axis: {
                  fill: "transparent",
                  stroke: "white",
                  strokeWidth: 1
                },
                axisLabel: {
                  textAnchor: "right",
                  padding: 25
                },
                grid: {
                  fill: "none",
                  stroke: "none",
                  pointerEvents: "painted"
                },
                ticks: {
                  fill: "white",
                  size: 5,
                  stroke: "white"
                },
                tickLabels: {
                  top: 10,
                  padding: 2,
                  fill: "white",
                  stroke: "transparent",
                  angle: -35
                }
              }
            }
          }}
        >
          <VictoryArea
            animate={{ duration: 1000 }}
            style={{
              data: {
                fill: "green",
                opacity: 0.7
              }
            }}
            labelComponent={<VictoryTooltip />}
            data={[...this.props.chartData]}
          />
          <VictoryArea
            animate={{ duration: 2000 }}
            style={{
              data: {
                fill: "red",
                opacity: 0.7
              }
            }}
            labelComponent={<VictoryTooltip />}
            data={[...this.props.chartSellData]}
          />
        </VictoryChart>
      </div>
    );
  }
}
