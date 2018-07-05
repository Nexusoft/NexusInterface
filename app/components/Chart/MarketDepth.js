// Copyright (c) 2016 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
import React, { Component } from "react";

import {
  FlexibleXYPlot,
  XAxis,
  YAxis,
  AreaSeries,
  GradientDefs,
  linearGradient,
  Crosshair,
  Borders,
  Hint
} from "react-vis";

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
        <div className="infobox">
          BTC Price: {this.state.crosshairValues.x} <br />
          NXS Volume: {this.state.crosshairValues.y}
        </div>
        <FlexibleXYPlot
          onMouseLeave={this._onMouseLeave}
          margin={{ left: 100, bottom: 100 }}
        >
          {/* <Hint
            value={this.state.crosshairValues}
            style={{
              fontSize: 14,
              text: {
                display: "none"
              }
            }}
          /> */}
          <XAxis
            style={{
              line: { stroke: "white" },
              ticks: { stroke: "white" },
              text: { stroke: "none", fill: "white" }
            }}
            tickFormat={v => `BTC ${v}`}
            tickLabelAngle={-45}
          />
          <YAxis
            style={{
              line: { stroke: "white" },
              ticks: { stroke: "white" },
              text: { stroke: "none", fill: "white" }
            }}
          />
          <GradientDefs>
            <linearGradient id="buySupport" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="green" stopOpacity={0.9} />
              <stop offset="100%" stopColor="green" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="sellSupport" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="red" stopOpacity={0.9} />
              <stop offset="100%" stopColor="red" stopOpacity={0.2} />
            </linearGradient>
          </GradientDefs>

          <AreaSeries
            onNearestX={this._onNearestXbuy}
            onSeriesMouseOver={() => this.whichseries(true)}
            color={"url(#buySupport)"}
            data={this.props.chartData}
          />
          <AreaSeries
            onNearestX={this._onNearestX}
            onSeriesMouseOver={() => this.whichseries(false)}
            color={"url(#sellSupport)"}
            data={this.props.chartSellData}
          />
        </FlexibleXYPlot>
      </div>
    );
  }
}
