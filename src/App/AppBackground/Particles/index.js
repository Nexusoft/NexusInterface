import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";


const NexusThemeBg = () => {
    const particlesInit = useCallback(async engine => {
        console.log(engine);
        // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
        // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
        // starting from v2 you can add only the features you need reducing the bundle size
        await loadFull(engine);
    }, []);

    const particlesLoaded = useCallback(async container => {
        await console.log(container);
    }, []);
    
    const options = {
      name: "Parallax",
      particles: {
          number: {
              value: 100,
              density: {
                  enable: true,
              },
          },
          color: {
              value: "#ffffff",
          },
          shape: {
              type: "circle",
          },
          opacity: {
              value: {
                  min: 0.1,
                  max: 0.5,
              },
              animation: {
                  enable: true,
                  speed: 3,
                  sync: false,
              },
          },
          size: {
              value: {
                  min: 1,
                  max: 10,
              },
              animation: {
                  enable: true,
                  speed: 20,
                  sync: false,
              },
          },
          links: {
              enable: true,
              distance: 150,
              color: "#96e7fa",
              opacity: 0.3,
              width: 1,
          },
          move: {
              enable: true,
              speed: 2,
          },
      },
      interactivity: {
          events: {
              onHover: {
                  enable: true,
                  mode: "grab",
                  parallax: {
                      enable: true,
                      smooth: 10,
                      force: 60,
                  },
              },
              onClick: {
                  enable: true,
                  mode: "push",
              },
          },
          modes: {
              grab: {
                  distance: 400,
                  links: {
                      opacity: 1,
                  },
              },
              bubble: {
                  distance: 400,
                  size: 40,
                  duration: 2,
                  opacity: 0.8,
              },
              repulse: {
                  distance: 200,
              },
              push: {
                  quantity: 4,
              },
              remove: {
                  quantity: 2,
              },
          },
      },
      background: {
          color: "#013e61",
      },
  };

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            loaded={particlesLoaded}
            options={options}
        />
    );
};

export default NexusThemeBg;
