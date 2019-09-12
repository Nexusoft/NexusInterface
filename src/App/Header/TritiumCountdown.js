import React from 'react';
import styled from '@emotion/styled';

const upgradeTime = new Date(2019, 8, 30).getTime();

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

const addZeros = num => (num < 10 ? '0' + num : num);

const secMs = 1000;
const minMs = secMs * 60;
const hourMs = minMs * 60;
const dayMs = hourMs * 24;
function diffDates(now, then) {
  const diff = then - now;
  let remaining = diff;
  const days = Math.floor(remaining / dayMs);
  remaining = remaining % dayMs;
  const hours = Math.floor(remaining / hourMs);
  remaining = remaining % hourMs;
  const minutes = Math.floor(remaining / minMs);
  remaining = remaining % minMs;
  const seconds = Math.floor(remaining / secMs);
  remaining = remaining % secMs;

  return {
    days: addZeros(days),
    hours: addZeros(hours),
    minutes: addZeros(minutes),
    seconds: addZeros(seconds),
  };
}

export default class TritiumCountdown extends React.Component {
  componentDidMount() {
    this.timer = setInterval(() => {
      this.forceUpdate();
    });
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    const now = Date.now();
    if (now >= upgradeTime) return null;

    const time = diffDates(now, upgradeTime);
    return (
      <Countdown>
        <CountdownLabel>Tritium network upgrade in</CountdownLabel>
        <CountdownClock>
          <Cube>
            <Number>{time.days}</Number>
            <Unit>days</Unit>
          </Cube>
          <Cube>
            <Number>{time.hours}</Number>
            <Unit>hours</Unit>
          </Cube>
          <Cube>
            <Number>{time.minutes}</Number>
            <Unit>mins</Unit>
          </Cube>
          <Cube>
            <Number>{time.seconds}</Number>
            <Unit>secs</Unit>
          </Cube>
        </CountdownClock>
      </Countdown>
    );
  }
}
