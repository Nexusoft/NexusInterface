import { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { blackBackground } from 'lib/theme';
import { fade } from 'utils/color';

export const gridSize = 40;

export const modernGridBackground = (theme) => theme.wallpaper !== blackBackground ? {
  backgroundColor: 'transparent',
  backgroundImage: 'none',
  isolation: 'isolate',
} : ({
  backgroundColor: '#181a1c',
  backgroundImage: `linear-gradient(${fade(theme.primary, 0.95)} 1px, transparent 1px), linear-gradient(90deg, ${fade(theme.primary, 0.95)} 1px, transparent 1px), radial-gradient(ellipse at 50% 45%, ${fade(theme.primary, 0.89)}, transparent 60%), radial-gradient(ellipse at 50% 45%, #24282b 0%, #1c1f21 55%, #17191b 100%)`,
  backgroundSize: `${gridSize}px ${gridSize}px, ${gridSize}px ${gridSize}px, 100% 100%, 100% 100%`,
  isolation: 'isolate',
});

const TracerCanvas = styled.canvas({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 0,
  '@media (prefers-reduced-motion: reduce)': { display: 'none' },
});

function createTrace(width, height, delay = 0) {
  const columns = Math.floor(width / gridSize);
  const rows = Math.floor(height / gridSize);
  let x = Math.floor(Math.random() * (columns + 1));
  let y = Math.floor(Math.random() * (rows + 1));
  let previous = null;
  const points = [[x * gridSize + 0.5, y * gridSize + 0.5]];

  for (let step = 0; step < 14; step += 1) {
    const choices = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) =>
      x + dx >= 0 && x + dx <= columns &&
      y + dy >= 0 && y + dy <= rows &&
      (!previous || dx !== -previous[0] || dy !== -previous[1])
    );
    if (!choices.length) break;
    const direction = choices[Math.floor(Math.random() * choices.length)];
    x += direction[0];
    y += direction[1];
    previous = direction;
    points.push([x * gridSize + 0.5, y * gridSize + 0.5]);
  }

  return { points, distance: -delay, speed: 65 + Math.random() * 40, phase: Math.random() * Math.PI * 2 };
}

function pointAt(points, distance) {
  const segment = Math.min(Math.floor(distance / gridSize), points.length - 2);
  const fraction = (distance - segment * gridSize) / gridSize;
  const start = points[segment];
  const end = points[segment + 1];
  return [start[0] + (end[0] - start[0]) * fraction, start[1] + (end[1] - start[1]) * fraction];
}

export default function GridTracers() {
  const theme = useTheme();
  const enabled = theme.wallpaper === blackBackground;
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;
    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    const context = canvas.getContext('2d');
    if (!context) return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0;
    let height = 0;
    let traces = [];
    let frame = null;
    let previousTime = null;
    let resizeFrame = null;
    let pixelRatio = 0;

    const resize = () => {
      const nextWidth = container.clientWidth;
      const nextHeight = container.clientHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      if (width === nextWidth && height === nextHeight && pixelRatio === ratio) return;
      width = nextWidth;
      height = nextHeight;
      pixelRatio = ratio;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      traces = Array.from({ length: 8 }, (_, i) => createTrace(width, height, i * 40));
    };

    const draw = (time) => {
      const elapsed = previousTime === null ? 0 : Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      context.clearRect(0, 0, width, height);
      traces.forEach((trace, index) => {
        const length = (trace.points.length - 1) * gridSize;
        const tail = 120;
        trace.distance += elapsed * trace.speed;
        if (trace.distance > length + tail) {
          traces[index] = createTrace(width, height, 40 + Math.random() * 160);
          return;
        }
        if (length === 0 || trace.distance < 0) return;
        const pulse = 0.55 + 0.25 * Math.sin(time / 400 + trace.phase);
        const fadeIn = Math.min(trace.distance / 40, 1);
        const fadeOut = Math.min((length + tail - trace.distance) / tail, 1);
        // Short segments create a fading tail, including around grid corners.
        for (let d = Math.max(0, trace.distance - tail); d < Math.min(length, trace.distance);) {
          const end = Math.min(d + 4, (Math.floor(d / gridSize) + 1) * gridSize, length, trace.distance);
          const from = pointAt(trace.points, d);
          const to = pointAt(trace.points, end);
          context.globalAlpha = pulse * fadeIn * fadeOut * (1 - (trace.distance - d) / tail);
          context.strokeStyle = '#00b7fa';
          context.shadowColor = '#00b7fa';
          context.shadowBlur = 9;
          context.lineWidth = 1.5;
          context.beginPath();
          context.moveTo(...from);
          context.lineTo(...to);
          context.stroke();
          d = end;
        }
      });
      frame = requestAnimationFrame(draw);
    };

    const updateAnimation = () => {
      cancelAnimationFrame(frame);
      previousTime = null;
      context.clearRect(0, 0, width, height);
      if (!reducedMotion.matches && !document.hidden) frame = requestAnimationFrame(draw);
    };
    // Keep the overlay aligned with the background when the overview scrolls.
    const align = () => {
      canvas.style.transform = `translate(${container.scrollLeft}px, ${container.scrollTop}px)`;
    };
    // Buffer writes run outside ResizeObserver delivery and do not size the layout.
    const observer = new ResizeObserver(() => {
      if (resizeFrame !== null) return;
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = null;
        resize();
      });
    });
    resize();
    align();
    observer.observe(container);
    container.addEventListener('scroll', align, { passive: true });
    reducedMotion.addEventListener('change', updateAnimation);
    document.addEventListener('visibilitychange', updateAnimation);
    updateAnimation();

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
      observer.disconnect();
      container.removeEventListener('scroll', align);
      reducedMotion.removeEventListener('change', updateAnimation);
      document.removeEventListener('visibilitychange', updateAnimation);
    };
  }, [enabled]);

  return enabled ? <TracerCanvas ref={canvasRef} aria-hidden="true" /> : null;
}
