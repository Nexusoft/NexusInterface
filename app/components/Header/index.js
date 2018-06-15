import React, { Component } from "react";
import { Link } from "react-router-dom";
import styles from "./style.css";

import * as RPC from "../../script/rpc";

// import { bindActionCreators } from 'redux';
// import { connect } from 'react-redux';
// import Counter from '../components/Counter';
// import * as CounterActions from '../actions/counter';

// function mapStateToProps(state) {
//   return {
//     counter: state.counter
//   };
// }

// function mapDispatchToProps(dispatch) {
//   return bindActionCreators(CounterActions, dispatch);
// }

// export default connect(mapStateToProps, mapDispatchToProps)(Counter);

export default class Header extends Component {
  componentWillMount() {
    RPC.PROMISE("getinfo", []).then(payload => console.log(payload));
  }

  render() {
    return (
      <div id="Header">
        <Link to="/">
          <img src="images/NXS-logo-min.png" alt="Nexus Logo" id="test" />
        </Link>
        <div id="hdr-line" />
      </div>
    );
  }
}
