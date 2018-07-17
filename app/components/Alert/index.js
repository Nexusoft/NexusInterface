import React, { Component } from "react";
import { createPortal } from "react-dom";

export default class Alert extends Component {
  constructor(props) {
    super(props);
    this.state = {
      alertList: props.alertList,
      options: props.options
    };
  }
  removeAlert(id) {}
  builder() {
    return this.state.alertList.map(() => {
      <div>
        <span
          style={{
            position: absolute,
            top: 0,
            right: "5px"
          }}
          onClick={() => this.closeAlert(this)}
        >
          X
        </span>
      </div>;
    });
  }
  render() {
    return <div className="alertBox">{this.builder()}</div>;
  }
}
