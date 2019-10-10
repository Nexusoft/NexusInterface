// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { remote } from 'electron';
import styled from '@emotion/styled';
import GA from 'lib/googleAnalytics';

// Internal Global
import Button from 'components/Button';
import { history } from 'lib/wallet';
import { openModal } from 'lib/ui';
import { switchUserTab } from 'lib/ui';
import { isCoreConnected, isLoggedIn } from 'selectors';
import ContextMenuBuilder from 'contextmenu';
import { legacyMode } from 'consts/misc';
import { apiGet } from 'lib/tritiumApi';
import { loadOwnedTokens, loadAccounts } from 'lib/user';
import Icon from 'components/Icon';

// Icons
import plusIcon from 'icons/plus.svg';
import searchIcon from 'icons/search.svg';

// Internal Local
import NewTokenModal from './NewTokenModal';
import Token from './Token';
import SearchTokenModal from './SearchTokenModal';

const mapStateToProps = state => ({
  coreConnected: isCoreConnected(state),
  userGenesis: state.core.userStatus.genesis,
  loggedIn: isLoggedIn(state),
  accounts: state.core.accounts,
  ownedTokens: state.core.tokens,
});

/**
 * The Address Book Page
 *
 * @class Tokens
 * @extends {Component}
 */
@connect(mapStateToProps)
class Tokens extends Component {
  state = {
    activeIndex: 0,
    usedTokens: [],
    searchToken: '',
  };

  constructor(props) {
    super(props);
    switchUserTab('Tokens');
  }

  /**
   * componentDidMount
   *
   * @memberof Tokens
   */
  componentDidMount() {
    if (legacyMode) {
      history.push('/');
    }
    window.addEventListener('contextmenu', this.setupcontextmenu, false);
    GA.SendScreen('Tokens');

    loadOwnedTokens();
    loadAccounts();
    this.gatherTokens();
  }

  gatherTokens() {
    const { accounts, ownedTokens } = this.props;

    let tempMap = new Map();
    if (accounts) {
      accounts.forEach(element => {
        if (tempMap.has(element.token_name || element.token)) return;

        if (!tempMap.has('NXS')) {
          tempMap.set('NXS', {
            address: '0000000000000000000000000',
            balance: 0,
            created: 1400000000,
            currentsupply: 1000000,
            decimals: 6,
            maxsupply: 1000000,
            modified: 1400000000,
            name: 'NXS',
            owner: '00000000000000000000000000000',
            pending: 0,
            unconfirmed: 0,
          });
          return;
        }
        const tokenInfo = this.getTokenInfo(element);
        tempMap.set(element.token_name || element.token, tokenInfo);
      });
    }
    if (ownedTokens) {
      ownedTokens.forEach(element => {
        if (tempMap.has(element.name || element.address)) return;
        tempMap.set(element.name || element.address, element);
      });
    }
    this.setState({
      usedTokens: tempMap,
    });
  }

  async getTokenInfo(element) {
    const info = await apiGet(
      element.token_name
        ? `tokens/get/token?name=${element.token_name}`
        : `tokens/get/token?address=${element.token}`
    );
    this.setState(prevState => {
      let usedTokens = prevState.usedTokens;
      usedTokens.set(element.token_name || element.token, info);
      return { usedTokens };
    });
  }

  /**
   * componentWillUnmount
   *
   * @memberof Tokens
   */
  componentWillUnmount() {
    window.removeEventListener('contextmenu', this.setupcontextmenu);
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.accounts !== prevProps.accounts ||
      this.props.ownedTokens !== prevProps.ownedTokens
    ) {
      this.gatherTokens();
    }
  }

  /**
   * Set up the context menu
   *
   * @param {*} e
   * @memberof Tokens
   */
  setupcontextmenu(e) {
    e.preventDefault();
    const contextmenu = new ContextMenuBuilder().defaultContext;
    //build default
    let defaultcontextmenu = remote.Menu.buildFromTemplate(contextmenu);
    defaultcontextmenu.popup(remote.getCurrentWindow());
  }

  returnTokenList() {
    const { usedTokens } = this.state;
    return Array.from(usedTokens, ([key, value]) => {
      return <Token key={key} token={value} owner={this.props.userGenesis} />;
    });
  }

  /**
   * Component's Renderable JSX
   *
   * @returns
   * @memberof Tokens
   */
  render() {
    const { searchToken } = this.state;

    return (
      <>
        <div className="flex space-between">
          <Button
            onClick={() => {
              openModal(NewTokenModal);
            }}
          >
            <Icon icon={plusIcon} className="space-right" />
            {'Create New Token'}
          </Button>
          <Button
            onClick={() => {
              openModal(SearchTokenModal);
            }}
          >
            <Icon icon={searchIcon} className="space-right" />
            {'Search For Token'}
          </Button>
        </div>
        <div>{this.returnTokenList()}</div>
      </>
    );
  }
}

export default Tokens;
