import { Component } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

import Button from 'components/Button';
import Tooltip from 'components/Tooltip';

const pulseRing = keyframes`
  0% {
    transform: translate(-50%,50%) scale(0.33);
  }
  80%, 100% {
    opacity: 0;
    transform: translate(-50%,50%)
  }
`;

const pulseDot = keyframes`
  0% {
    transform: translate(-50%,50%) scale(0.8);
  }
  50% {
    transform: translate(-50%,50%) scale(1);
  }
  100% {
    transform: translate(-50%,50%) scale(0.8);
  }
`;

const BeaconIcon = styled.div(({ theme }) => ({
  display: 'block',
  '&::before': {
    content: '""',
    display: 'block',
    width: 20,
    height: 20,
    background: theme.primary,
    borderRadius: 45,
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translate(-50%,50%)',
    animation: `${pulseRing} 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite`,
  },
  '&::after': {
    content: '""',
    height: 6,
    width: 6,
    background: theme.foreground,
    borderRadius: '50%',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translate(-50%,50%)',
    animation: `${pulseDot} 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite`,
  },
}));

const BoxBuilder = (fill, blur) => {
  const color = `black ${fill}% , transparent ${fill + blur}%`;
  const sides = [0, 45, 90, 135, 180, 225, 270, 315];
  return sides.map((e) => `linear-gradient(${e}deg,${color})`).join();
};

const slideDefaults = {};

/** Slides:
 * fill: 5 ()
 * blur: 10 ()
 * textTitle: ''
 * textBody: ''
 * tooltipPosition: 'right' (top,left,bottom,right)
 * toggleBeacon: false
 * targetParents: 0 (1 -> one parent up etc)
 */

const slides = [
  {
    textTitle: 'Test1',
    textBody: 'TESTING 123456',
    targetParents: 2,
  },
  {
    textTitle: 'Test2',
    textBody: 'TESTING ASDFGHJKL',
  },
];

const Slide = ({
  fill = 5,
  blur = 10,
  position,
  textTitle,
  textBody,
  toggleBeacon,
  onNext,
  onClose,
  ...rest
}) => (
  <>
    {console.log(rest)}
    <div
      style={{
        width: position?.width + 2 * (fill + blur) || 0,
        height: position?.height + 2 * blur || 0,
        position: 'absolute',
        top: position?.top - blur || 0,
        left: position?.left - blur || 0,
      }}
    >
      <>
        <div
          style={{
            height: '100%',
            background: '#000000c9',
            WebkitMaskImage: BoxBuilder(fill, blur),
          }}
        />

        <Tooltip.Base
          skin={'default'}
          position={'right'}
          domRect={position}
          forceOpen={true}
          tooltip={'sada'}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignContent: 'center',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div style={{ width: '100%', height: '2em' }}>
              <Button style={{ height: '1em', width: '1em', float: 'right' }}>
                X
              </Button>
            </div>
            <div>
              <div style={{ textAlign: 'center', float: 'center' }}>
                {textTitle}
              </div>
              <div>{textBody}</div>
            </div>
            <div style={{ width: '100%' }}>
              <Button onClick={onNext}>Next</Button>
            </div>
          </div>
        </Tooltip.Base>
        <div
          style={{
            height: '100%',
            width: '100%',
            top: '0px',
            position: 'absolute',
            outline: '5000px solid #000000c9',
          }}
        />
      </>
      <BeaconIcon />
    </div>
  </>
);

const getParent = (div) => div.parentElement;

const getTarget = (slideOn) => {
  let parents = slides[slideOn].targetParents;
  let target = document?.querySelector(`[tutorial='${slideOn}']`);
  if (!target) return;
  if (parents) {
    while (parents > 0) {
      target = getParent(target);
      parents--;
    }
  }
  console.log(target);
  return target?.getBoundingClientRect();
};

/*
const reactSlides = slides.map((e, i, a) => (
  <Slide fill={e.fill} blur={e.blur} position={getTarget(i)} />
));
*/

class OnBoarding extends Component {
  constructor() {
    super();
    this.state = {
      slideOn: 0,
    };
  }
  render() {
    const e = slides[this.state.slideOn];
    console.log(this.state.slideOn);
    console.log(e);
    return (
      <Slide
        onNext={() => this.setState({ slideOn: 1 })}
        position={getTarget(this.state.slideOn)}
        {...e}
      />
    );
  }
}

export default OnBoarding;
