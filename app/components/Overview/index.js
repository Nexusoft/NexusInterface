import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";
import { connect } from "react-redux";

const mapStateToProps = state => ({
  ...state.common
});

const mapDispatchToProps = dispatch => ({});

class Overview extends Component {
  connectionsImage() {
    const con = this.props.connections;
    if (con <= 4) {
      return "images/Connections0.png";
    } else if (con > 4 && con <= 8) {
      return "images/Connections4.png";
    } else if (con > 8 && con <= 12) {
      return "images/Connections8.png";
    } else if (con > 12 && con <= 14) {
      return "images/Connections12.png";
    } else if (con > 14 && con <= 16) {
      return "images/Connections14.png";
    } else if (con > 16) {
      return "images/Connections16.png";
    } else {
      return "images/Connections0.png";
    }
  }

  render() {
    return (
      <div id="overviewPage">
        <div>
          <div className="overviewInfo">
            <div className="h2"> B A L E N C E</div>
            <div id="nxs-getinfo-balance">{this.props.balance}</div>
            <div id="coin">NXS</div>
          </div>
          <div />
          <div />
          <div />
        </div>
        <div id="globe" />
        <div className="right-stats">
          <div className="h2">Connections</div>
          <div id="nxs-connections-info">
            <img
              id="nxs-getinfo-connections-image"
              src={this.connectionsImage()}
            />
            <div id="nxs-getinfo-connections">{this.props.connections}</div>
          </div>
          <div className="h2">Block Weight</div>
          <div id="nxs-blockweight-info">
            <img
              id="nxs-getinfo-blockweight-image"
              src="images/BlockWeight-0.png"
            />
            <div id="nxs-getinfo-blockweight">{this.props.blockweight}</div>
          </div>
          <div className="h2">Block Count</div>
          <div id="nxs-blocks-info">
            <img src="images/nxs-blocks.png" />
            <div id="nxs-getinfo-blocks">{this.props.blocks}</div>
          </div>
          <div className="h2">Trust Weight</div>
          <div id="nxs-trustweight-info">
            <img id="nxs-getinfo-trustweight-image" src="images/trust00.png" />
            <div id="nxs-getinfo-trustweight">{this.props.trustweight}</div>
          </div>
          <div className="h2">Interest Weight</div>
          <div id="nxs-interestweight-info">
            <img src="images/nxs-chart.png" />
            <div id="nxs-getinfo-interestweight">
              {this.props.interestweight + "%"}
            </div>
          </div>
          <div className="h2">Stake Weight</div>
          <div id="nxs-stakeweight-info">
            <img src="images/nxs-staking.png" />
            <div id="nxs-getinfo-stakeweight">{this.props.stakeweight}</div>
          </div>
        </div>
      </div>
    );
  }
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Overview);
