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
import {
  cloneElement,
  Children,
  useEffect,
  useState,
  useRef,
  ComponentProps,
} from 'react';
import ReactDOM from 'react-dom';
import styled from '@emotion/styled';

// Internal
import { arrowStyles } from 'components/Arrow';
import { timing, animations, zIndex } from 'styles';

const spacing = 10;
const arrowPadding = 15;
const positionToArrowDirection = {
  top: 'down',
  bottom: 'up',
  left: 'right',
  right: 'left',
} as const;

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipAlign = 'start' | 'center' | 'end';
export type TooltipSkin = 'default' | 'error';

const tooltipPositioning = (rect: DOMRect, position: TooltipPosition) => {
  switch (position) {
    case 'top':
      return { bottom: window.innerHeight + spacing - rect.top };
    case 'bottom':
      return { top: rect.bottom + spacing };
    case 'left':
      return { right: window.innerWidth + spacing - rect.left };
    case 'right':
      return { left: rect.right + spacing };
  }
};

const tooltipAligning = (
  rect: DOMRect,
  position: TooltipPosition,
  align: TooltipAlign
) => {
  if (position === 'top' || position === 'bottom') {
    switch (align) {
      case 'start':
        return { left: rect.left };
      case 'end':
        return { right: window.innerWidth - rect.right };
      case 'center':
        return {
          left: (rect.left + rect.right) / 2,
          transform: 'translateX(-50%)',
        };
    }
  } else {
    // if (position === 'left' || position === 'right')
    switch (align) {
      case 'start':
        return { top: rect.top };
      case 'end':
        return { bottom: window.innerHeight - rect.bottom };
      case 'center':
        return {
          top: (rect.top + rect.bottom) / 2,
          transform: 'translateY(-50%)',
        };
    }
  }
};

const arrowPositioning = (position: TooltipPosition) => ({
  [position]: '100%',
});

const arrowAligning = (position: TooltipPosition, align: TooltipAlign) => {
  if (position === 'top' || position == 'bottom') {
    switch (align) {
      case 'start':
        return { left: arrowPadding };
      case 'end':
        return { right: arrowPadding };
      case 'center':
        return { left: '50%', transform: 'translateX(-50%)' };
    }
  } else {
    // if (position === 'left' || position == 'right')
    switch (align) {
      case 'start':
        return { top: arrowPadding };
      case 'end':
        return { bottom: arrowPadding };
      case 'center':
        return { top: '50%', transform: 'translateY(-50%)' };
    }
  }
};

const TooltipComponent = styled.div<{
  position: TooltipPosition;
  align: TooltipAlign;
  skin: TooltipSkin;
  maxWidth?: number;
}>(
  {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    width: 'max-content',
    borderRadius: 4,
    boxShadow: '0 0 8px rgba(0,0,0,.7)',
    fontSize: 15,
    padding: '.4em .8em',
    animation: `${animations.fadeIn} ${timing.normal} ease-out`,
    '&::before': {
      content: '""',
      position: 'absolute',
    },
  },
  ({ maxWidth }) => ({
    maxWidth: maxWidth || 300,
  }),
  ({ skin, theme }) => {
    switch (skin) {
      case 'default':
        return {
          background: theme.raise(theme.background, 0.2),
          color: theme.foreground,
        };
      case 'error':
        return {
          background: theme.danger,
          color: theme.dangerAccent,
        };
    }
  },
  ({ position }) =>
    (position === 'top' || position === 'bottom') && {
      textAlign: 'center',
    },
  ({ position, skin, theme }) => ({
    '&::before': arrowStyles({
      direction: positionToArrowDirection[position],
      width: 15,
      height: 8,
      color:
        skin === 'default'
          ? theme.raise(theme.background, 0.2)
          : skin === 'error'
          ? theme.danger
          : undefined,
    }),
  }),
  ({ position, align }) => ({
    '&::before': {
      ...arrowPositioning(position),
      ...arrowAligning(position, align),
    },
  })
);

function TooltipPortal(props: ComponentProps<typeof TooltipComponent>) {
  const ref = useRef<HTMLDivElement>();
  if (!ref.current) ref.current = document.createElement('div');
  useEffect(() => {
    if (!ref.current) return;
    document.getElementsByTagName('body')[0].appendChild(ref.current);
    return () => {
      if (!ref.current) return;
      document.getElementsByTagName('body')[0].removeChild(ref.current);
    };
  }, [ref.current]);

  return ReactDOM.createPortal(<TooltipComponent {...props} />, ref.current);
}

export interface TooltipTriggerProps
  extends Omit<
    ComponentProps<typeof TooltipPortal>,
    'position' | 'align' | 'skin'
  > {
  position?: TooltipPosition;
  align?: TooltipAlign;
  skin?: TooltipSkin;
  tooltip?: React.ReactNode;
  children: React.ReactElement;
  style?: React.CSSProperties;
}

/**
 * Triggers the Tooltip
 */
function TooltipTrigger({
  position = 'bottom',
  align = 'center',
  skin = 'default',
  children,
  tooltip,
  style,
  ...rest
}: TooltipTriggerProps) {
  const [active, setActive] = useState(false);
  const [tooltipStyles, setTooltipStyles] = useState({});
  const triggerRef = useRef<HTMLElement>();

  const showTooltip = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipStyles = {
      position: 'fixed',
      zIndex: zIndex.tooltips,
      ...tooltipPositioning(rect, position),
      ...tooltipAligning(rect, position, align),
    };

    setActive(true);
    setTooltipStyles(tooltipStyles);
  };

  const hideTooltip = () => {
    setActive(false);
  };

  return (
    <>
      {cloneElement(Children.only(children), {
        onMouseEnter: showTooltip,
        onMouseLeave: hideTooltip,
        ref: triggerRef,
      })}
      {!!tooltip && active && (
        <TooltipPortal
          style={{ ...tooltipStyles, ...style }}
          {...{ position, align, skin }}
          {...rest}
        >
          {tooltip}
        </TooltipPortal>
      )}
    </>
  );
}

type TooltipType = typeof TooltipComponent & {
  Portal: typeof TooltipPortal;
  Trigger: typeof TooltipTrigger;
};
const Tooltip: TooltipType = TooltipComponent as TooltipType;
Tooltip.Portal = TooltipPortal;
Tooltip.Trigger = TooltipTrigger;

export default Tooltip;
