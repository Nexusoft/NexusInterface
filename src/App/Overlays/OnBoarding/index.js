const BoxBuilder = (fill, blur) => {
  const color = `black ${fill}% , transparent ${fill + blur}%`;
  const sides = [0, 45, 90, 135, 180, 225, 270, 315];
  return sides.map((e) => `linear-gradient(${e}deg,${color})`).join();
};

const OnBoarding = ({ fill, blur, position }) => (
  <>
    <div
      style={{
        width: position?.width + 2 * (fill + blur) || 0,
        height: position?.height + 2 * blur || 0,
        position: 'absolute',
        top: position?.top - blur || 0,
        left: position?.left - blur || 0,
      }}
    >
      {console.log(position && position)}
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

export default OnBoarding;
