/**
 * Important note - This file is imported into module_preload.js, either directly or
 * indirectly, and will be a part of the preload script for modules, therefore:
 * - Be picky with importing stuffs into this file, especially for big
 * files and libraries. The bigger the preload scripts get, the slower the modules
 * will load.
 * - Don't assign anything to `global` variable because it will be passed
 * into modules' execution environment.
 * - Make sure this note also presents in other files which are imported here.
 */

// External
import { useRef, useEffect, HTMLAttributes, RefObject } from 'react';
import ReactDOM from 'react-dom';
import styled from '@emotion/styled';

// Internal
import { animations, timing, zIndex } from 'styles';

const OverlayComponent = styled.div<{
  zPriority?: number;
}>(
  {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ({ zPriority = 0 }) => ({
    zIndex: zIndex.overlays + zPriority,
  })
);

const OverlayBackground = styled.div<{
  dimmed?: boolean;
}>(
  {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    animation: `${animations.fadeIn} ${timing.quick} ease-out`,
    animationFillMode: 'both',
  },
  ({ dimmed }) =>
    dimmed && {
      background: 'rgba(0,0,0,0.5)',
    }
);

export interface OverlayProps extends HTMLAttributes<HTMLDivElement> {
  dimBackground?: boolean;
  onBackgroundClick?: () => void;
  backgroundRef?: RefObject<HTMLDivElement>;
  zPriority?: number;
}

export default function Overlay({
  dimBackground,
  onBackgroundClick,
  backgroundRef,
  children,
  zPriority,
  ...rest
}: OverlayProps) {
  const nodeRef = useRef<HTMLDivElement>();
  const getNode = () => {
    if (!nodeRef.current) {
      nodeRef.current = document.createElement('div');
    }
    return nodeRef.current;
  };

  useEffect(() => {
    const body = document.getElementsByTagName('body')[0];
    body.appendChild(getNode());
    return () => {
      body.removeChild(getNode());
    };
  }, []);

  return ReactDOM.createPortal(
    <OverlayComponent zPriority={zPriority} {...rest}>
      <OverlayBackground
        ref={backgroundRef}
        dimmed={dimBackground}
        onClick={onBackgroundClick}
      />
      {children}
    </OverlayComponent>,
    getNode()
  );
}
