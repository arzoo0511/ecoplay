import React, { useState, useRef, useCallback, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  side?: 'top' | 'bottom';
  /** Skip tap-to-toggle on touch devices (use for buttons with their own click actions) */
  disableTouchToggle?: boolean;
}

const FOCUSABLE = new Set(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA']);

function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (value: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') ref(value);
      else if (ref) (ref as React.MutableRefObject<T | null>).current = value;
    });
  };
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = 'top',
  disableTouchToggle = false,
}) => {
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipId = useId();
  const isTouchRef = useRef(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCoords({
      top: side === 'top' ? rect.top - 6 : rect.bottom + 6,
      left: rect.left + rect.width / 2,
    });
  }, [side]);

  const show = useCallback(() => {
    updatePosition();
    setVisible(true);
  }, [updatePosition]);

  const hide = useCallback(() => {
    if (!isTouchRef.current) setVisible(false);
  }, []);

  const handleTouchClick = (e: React.MouseEvent) => {
    if (disableTouchToggle || !window.matchMedia('(hover: none)').matches) return;
    e.stopPropagation();
    setVisible((prev) => {
      if (!prev) updatePosition();
      return !prev;
    });
  };

  useEffect(() => {
    if (!visible || !isTouchRef.current) return;
    const close = () => setVisible(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const onScroll = () => updatePosition();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [visible, updatePosition]);

  const needsTabIndex =
    !children.props.tabIndex &&
    !FOCUSABLE.has(
      typeof children.type === 'string' ? children.type.toUpperCase() : ''
    );

  const trigger = React.cloneElement(children, {
    ref: mergeRefs(
      (children as React.ReactElement & { ref?: React.Ref<HTMLElement> }).ref,
      (node: HTMLElement | null) => {
        triggerRef.current = node;
      }
    ),
    onPointerDown: (e: React.PointerEvent) => {
      children.props.onPointerDown?.(e);
      isTouchRef.current = e.pointerType === 'touch';
    },
    onMouseEnter: (e: React.MouseEvent) => {
      children.props.onMouseEnter?.(e);
      show();
    },
    onMouseLeave: (e: React.MouseEvent) => {
      children.props.onMouseLeave?.(e);
      hide();
    },
    onFocus: (e: React.FocusEvent) => {
      children.props.onFocus?.(e);
      show();
    },
    onBlur: (e: React.FocusEvent) => {
      children.props.onBlur?.(e);
      hide();
    },
    onClick: (e: React.MouseEvent) => {
      children.props.onClick?.(e);
      handleTouchClick(e);
    },
    'aria-describedby': visible
      ? tooltipId
      : children.props['aria-describedby'],
    ...(needsTabIndex ? { tabIndex: 0 } : {}),
  });

  const motionProps =
    side === 'top'
      ? { initial: { opacity: 0, scale: 0.95, y: 6 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.95, y: 6 } }
      : { initial: { opacity: 0, scale: 0.95, y: -6 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.95, y: -6 } };

  return (
    <>
      {trigger}
      {createPortal(
        <AnimatePresence>
          {visible && (
            <motion.div
              id={tooltipId}
              role="tooltip"
              {...motionProps}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                top: coords.top,
                left: coords.left,
                transform: side === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
                zIndex: 9999,
              }}
              className="pointer-events-none px-3.5 py-2.5 text-xs sm:text-sm text-center text-slate-100 bg-slate-950/95 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl max-w-[220px] whitespace-normal"
            >
              {content}
              {/* Arrow */}
              {side === 'top' && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent"
                  style={{ borderTopColor: 'rgba(2, 6, 23, 0.95)' }}
                />
              )}
              {side === 'bottom' && (
                <div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 border-[6px] border-transparent"
                  style={{ borderBottomColor: 'rgba(2, 6, 23, 0.95)' }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default Tooltip;