/*
  Title: List
  Description: This module displays the trust list with sorting
   on percents. This is also a basic example for a module.
  Last Modified by: Brian Smith
*/
// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { remote } from 'electron';

// Internal Dependencies
import Icon from 'components/common/Icon';
import styles from './style.css';
import * as RPC from 'scripts/rpc';
import * as TYPE from 'actions/actiontypes';
import { FormattedMessage } from 'react-intl';
import ContextMenuBuilder from 'contextmenu';

// Images
import trustIcon from 'images/trust-list.sprite.svg';

// React-Redux mandatory methods
const mapStateToProps = state => {
  return { ...state.list, ...state.common, ...state.overview };
};
const mapDispatchToProps = dispatch => ({
  GetListDump: returnedData =>
    dispatch({ type: TYPE.GET_TRUST_LIST, payload: returnedData }),
  ToggleSortDir: () => dispatch({ type: TYPE.TOGGLE_SORT_DIRECTION }),
});

class List extends Component {
  // React Method (Life cycle hook)
  componentDidMount() {
    RPC.PROMISE('getnetworktrustkeys', []).then(payload => {
      this.props.GetListDump(payload.keys);
    });
    this.props.googleanalytics.SendScreen('TrustList');
    window.addEventListener('contextmenu', this.setupcontextmenu, false);
  }
  // React Method (Life cycle hook)
  componentWillUnmount() {
    window.removeEventListener('contextmenu', this.setupcontextmenu);
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.connections === undefined &&
      this.props.connections !== undefined
    ) {
      RPC.PROMISE('getnetworktrustkeys', []).then(payload => {
        this.props.GetListDump(payload.keys);
      });
    }
  }

  // Class methods
  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  buildList() {
    if (this.props.trustlist) {
      let sortableList = [...this.props.trustlist];

      if (this.props.acc) {
        sortableList = sortableList.sort(
          (a, b) => b.interestrate - a.interestrate
        );
      } else {
        sortableList = sortableList.sort(
          (a, b) => a.interestrate - b.interestrate
        );
      }

      return sortableList.map(ele => (
        <tr key={ele.address.slice(0, 8)}>
          <td key={ele.address.slice(0, 9)}>{ele.address}</td>

          <td key={ele.address.slice(0, 10)}>{ele.interestrate}</td>
        </tr>
      ));
    }
  }

  // Mandatory React method
  render() {
    return (
      <div id="trustlist" className="animated fadeIn">
        <h2>
          <Icon icon={trustIcon} className="hdr-img" />
          <FormattedMessage
            id="TrustList.TrustList"
            defaultMessage="Trust List"
          />
        </h2>

        <div className="panel">
          {this.props.isInSync === false ||
          this.props.connections === undefined ? (
            <h2>
              <FormattedMessage
                id="TrustList.SyncMsg"
                defaultMessage="Please let your wallet sync with the network"
              />
            </h2>
          ) : (
            <div id="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>
                      <div>
                        <FormattedMessage
                          id="TrustList.Address"
                          defaultMessage="Address"
                        />
                      </div>
                    </th>

                    <th onClick={() => this.props.ToggleSortDir()}>
                      <div>
                        {' '}
                        <FormattedMessage
                          id="TrustList.InterestRate"
                          defaultMessage="Stake Reward"
                        />
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody>{this.buildList()}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }
}

// Mandatory React-Redux method
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(List);
