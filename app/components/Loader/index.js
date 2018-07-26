import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { connect } from "react-redux";

const mapStateToProps = state => {
  return { ...state.common };
};

const mapDispatchToProps = dispatch => ({});
class Loader extends Component {
  render() {
    return (
        <div id="orbit-container">
            <div id="orbit">
                <div id="orbit-cirlce"></div>
            </div>
            <div id="tritium">
                <div id="proton1"></div>
                <div id="proton2"></div>
                <div id="proton3"></div>
            </div>           
        </div>
    )
    return (
        <div id="version">T R I T I U M</div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Loader);