import React, { Component } from "react";
import { Line } from "react-chartjs-2";

export default class Chart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chartData: props.chartData,
      chartOptions: props.options
    };
  }

  static defaultProps = {
    options: {
      title: {
        display: true,
        text: "",
        fontSize: 25
      },
      legend: {
        display: true,
        position: "bottom"
      }
    }
  };

  render() {
    return (
      <div className="chart">
        <Line data={this.state.chartData} options={this.state.chartOptions} />
      </div>
    );
  }
}
