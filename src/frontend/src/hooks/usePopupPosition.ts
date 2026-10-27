import { RefObject, useLayoutEffect, useRef, useState } from "react";

/**
 * Measures the anchor element and returns whatever `compute` derives from its
 * DOMRect (e.g. whether a popup should open upward). Re-measures on open, on
 * window resize, on scroll (capture phase, so scrollable ancestors count) and
 * when the anchor itself resizes, via ResizeObserver.
 *
 * `compute` is read through a ref, so a new closure does not re-subscribe.
 *
 * @returns the computed value, or null before the first measurement.
 */
export const usePopupPosition = <P>(
  anchorRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  compute: (rect: DOMRect) => P,
): P | null => {
  const [position, setPosition] = useState<P | null>(null);
  const computeRef = useRef(compute);
  computeRef.current = compute;

  useLayoutEffect(() => {
    if (!isOpen) return;
    const el = anchorRef.current;
    if (!el) return;

    const updatePosition = () => {
      setPosition(computeRef.current(el.getBoundingClientRect()));
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    const observer = new ResizeObserver(updatePosition);
    observer.observe(el);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      observer.disconnect();
    };
  }, [anchorRef, isOpen]);

  return position;
};
