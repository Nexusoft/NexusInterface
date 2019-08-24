// External
import React from 'react';
import styled from '@emotion/styled';

//Internal
import logoFull from '../Header/logo-full-beta.sprite.svg';
import Icon from 'components/Icon';

const Logo = styled(Icon)(({ theme }) => ({
  display: 'block',
  height: 50,
  width: 'auto',
  marginLeft: 'auto',
  marginRight: 'auto',
  fill: 'blue',
}));

const Instructions = styled.div({
  textAlign: 'center',
  marginLeft: '10%',
  marginRight: '10%',
  color: 'black',
  fontWeight: 'bold',
});

const WordBox = styled.div({
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'grid',
  alignItems: 'center',
  gridTemplateColumns: 'auto auto auto auto',
  gridTemplateRows: 'auto',
  gridGap: '1em .5em',
});

const Word = styled.div({
  background: 'black',
  textAlign: 'center',
  fontWeight: 'bold',
  color: 'white',
});

class PrintRecovery extends React.Component {
  returnWords() {
    return this.props.twentyWords.map(e => {
      return <Word key={e}>{e}</Word>;
    });
  }

  returnInstrcutions() {
    return 'These are your 20 words that make up your recovery password, DO NOT LOSE THESE. These will never be shown again, if you misplace these your normal password is the only way to get into your wallet. Keep these safe!';
  }

  render() {
    return (
      <div style={{ margin: '10%', background: 'white' }}>
        <Logo icon={logoFull} />
        <Instructions>{this.returnInstrcutions()}</Instructions>
        <WordBox>{this.returnWords()}</WordBox>
      </div>
    );
  }
}

export default PrintRecovery;
