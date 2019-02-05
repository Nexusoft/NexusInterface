/*
  Title: Loader
  Description: Creates the loader image of tritium animated.
  Last Modified by: Brian Smith
*/
// External Dependencies
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

// Internal Dependencies
import styles from './style.css';

// React-Redux mandatory methods
const mapStateToProps = state => {
  return { ...state.common };
};
//const mapDispatchToProps = dispatch => {};

/**
 * Page loader that displays the Tritium Logo
 *
 * @class Loader
 * @extends {Component}
 */
class Loader extends Component {
  state = {
    loading: true,
  };
  // React Method (Life cycle hook)
  componentDidMount() {
    this.autoClose = setTimeout(() => this.setState({ loading: false }), 5000);
  }

  componentWillUnmount() {
    clearTimeout(this.autoClose);
  }

  // Mandatory React method
  render() {
    const { loading } = this.state;

    if (loading) {
      return (
        <div id="loader" className="animated fadeIn">
          <div id="orbit-container">
            <div id="orbit">
              <div id="orbit-cirlce" />
            </div>
            <div id="tritium">
              <div id="proton1" />
              <div id="proton2" />
              <div id="proton3" />
            </div>
          </div>
          <div id="version">Nexus Tritium Wallet</div>
        </div>
      );
    }

    return null; // render null when app is ready
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps
  //  mapDispatchToProps
)(Loader);
