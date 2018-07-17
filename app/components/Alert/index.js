import React, { Component } from "react";
import { createPortal } from "react-dom";

export default class Alert extends Component {
  constructor(props) {
    super(props);
    this.state = {
      alertMaster: {},
      options: props.options
    };
  }

  componentDidMount() {
    this.props.alertlist.forEach((element, i) => {
      this.setState({
        alertMaster: {
          ...this.state.alertMaster,
          i: element
        }
      });
    });
    console.log(this.state);
  }

  closeAlert(index) {
    this.setState({
      alertMaster: {
        ...alertMaster,
        index: null
      }
    });
  }
  builder() {
    // return this.state.alertList.map((ele, i) => {
    //   <div>
    //     <span
    //       style={{
    //         position: absolute,
    //         top: 0,
    //         right: "5px"
    //       }}
    //       onClick={() => this.closeAlert(i)}
    //     >
    //       X
    //     </span>
    //     {ele}
    //   </div>;
    // });
  }
  render() {
    return <div className="alertBox">{this.builder()}</div>;
  }
}
