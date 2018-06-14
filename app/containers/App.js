// @flow
import React, { Component } from "react";
import type { Children } from "react";

export default class App extends Component {
  props: {
    children: Children
  };

  render() {
    return <div id="App">{this.props.children}</div>;
  }
}
