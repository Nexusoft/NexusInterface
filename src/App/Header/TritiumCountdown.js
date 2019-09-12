import React from 'react';
import styled from '@emotion/styled';

const Countdown = styled.div(({ theme }) => ({
  position: 'absolute',
  top: 5,
  left: 5,
  color: theme.primary,
  opacity: 0.5,
  fontWeight: 'bold',
  textTransform: 'uppercase',
  textAlign: 'center',
  userSelect: 'none',
  padding: '5px',
  border: `1px solid ${theme.primary}`,
}));

const CountdownLabel = styled.div({
  fontSize: 13,
  letterSpacing: 1,
});

const CountdownClock = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const Cube = styled.div({
  textAlign: 'center',
  margin: '0 10px',
});

const Number = styled.div({
  fontSize: 18,
  lineHeight: 1.4,
});

const Unit = styled.div({
  fontSize: 10,
  letterSpacing: 3,
  lineHeight: 1.1,
});

export default class TritiumCountdown extends React.Component {
  componentDidMount() {}

  render() {
    return (
      <Countdown>
        <CountdownLabel>Tritium network upgrade in</CountdownLabel>
        <CountdownClock>
          <Cube>
            <Number>12</Number>
            <Unit>days</Unit>
          </Cube>
          <Cube>
            <Number>05</Number>
            <Unit>hours</Unit>
          </Cube>
          <Cube>
            <Number>48</Number>
            <Unit>mins</Unit>
          </Cube>
          <Cube>
            <Number>23</Number>
            <Unit>secs</Unit>
          </Cube>
        </CountdownClock>
      </Countdown>
    );
  }
}
