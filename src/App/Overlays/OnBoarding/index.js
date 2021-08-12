import { Component } from 'react';

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

let slideOn = 0;

const Slide = ({ fill = 5, blur = 10, position }) => (
  <>
    {' '}
    {console.log(position && position)}
    <div
      style={{
        width: position?.width + 2 * (fill + blur) || 0,
        height: position?.height + 2 * blur || 0,
        position: 'absolute',
        top: position?.top - blur || 0,
        left: position?.left - blur || 0,
      }}
    >
      <div
        style={{
          height: '100%',
          background: '#000000c9',
          WebkitMaskImage: BoxBuilder(fill, blur),
        }}
      />
      <div
        style={{
          height: '100%',
          width: '100%',
          top: '0px',
          position: 'absolute',
          outline: '5000px solid #000000c9',
        }}
      />
    </div>
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        pointerEvents: 'all',
      }}
    />
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

var ggggg = 0;

class OnBoarding extends Component {
  constructor() {
    super();
    this.state = {
      ggggg: 0,
    };

    setTimeout(() => {
      this.setState({ ggggg: 1 });
    }, 3000);
  }
  render() {
    const e = slides[ggggg];
    console.log(ggggg);
    console.log(e);
    console.log(<Slide props={e} position={getTarget(0)} />);
    return (
      <>
        <button onClick={() => this.setState({ ggggg: ggggg++ })}>
          asdads
        </button>
        <Slide
          fill={e.fill}
          blur={e.blur}
          position={getTarget(this.state.ggggg)}
        />
      </>
    );
  }
}

export default OnBoarding;
