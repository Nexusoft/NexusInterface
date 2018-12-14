/*
Title: Block Exporer
Description: Unfinished block explorer see nxsorbitalscan for examples.
Last Modified by: Brian Smith
*/

// External Dependencies
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './style.css';
import { connect } from 'react-redux';
import { remote } from 'electron';

// Internal Dependencies
import * as TYPE from 'actions/actiontypes';
import ContextMenuBuilder from 'contextmenu';

// Images
import blockexplorerimg from 'images/blockexplorer.svg';

// React-Redux mandatory methods
const mapStateToProps = state => {
  return { ...state.common, ...state.transactions };
};
const mapDispatchToProps = dispatch => ({
  SetExploreInfo: returnData => {
    dispatch({ type: TYPE.SET_TRANSACTION_EXPLOREINFO, payload: returnData });
  },
});

class BlockExplorer extends Component {
  // React Method (Life cycle hook)
  componentDidMount() {
    window.addEventListener('contextmenu', this.setupcontextmenu, false);
  }
  // React Method (Life cycle hook)
  componentWillUnmount() {
    window.removeEventListener('contextmenu', this.setupcontextmenu);
  }

  // Class methods
  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  // Mandatory React method
  render() {
    if (this.props.exploreinfo != undefined && this.props.exploreinfo != null) {
      this.props.SetExploreInfo(null);
    }

    return (
      <div id="blockexplorer" className="animated fadeIn">
        <h2>
          <img src={blockexplorerimg} />
          Block Explorer
        </h2>

        <div className="panel" />
      </div>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BlockExplorer);
