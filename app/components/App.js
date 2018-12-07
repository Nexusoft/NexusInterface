import React, { Component } from 'react';
import IntlWrapper from './IntlWrapper';
import styled from '@emotion/styled';

const AppWrapper = styled.div({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'grid',
  height: '100%',
  gridTemplateColumns: '1fr',
  gridTemplateRows: '74px auto 75px',
  gridTemplateAreas: '"header" "content" "navigation"',
});

class App extends Component {
  render() {
    return (
      <IntlWrapper>
        <AppWrapper>{this.props.children}</AppWrapper>
      </IntlWrapper>
    );
  }
}
export default App;
