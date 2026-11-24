import { createSignal } from "solid-js";

import { styled } from "styled-system/jsx";

/**
 * Vertical drag handle that resizes the panel next to it
 *
 * Works with the pointer (drag), the keyboard (arrow keys while focused) and
 * double click (back to the default width).
 */
export function ResizeHandle(props: {
  /**
   * Which edge of the panel the handle sits on
   */
  edge: "left" | "right";
  /**
   * Current width
   */
  width: () => number;
  /**
   * Called with the new width while resizing
   */
  onResize: (width: number) => void;
  /**
   * Restore the default width
   */
  onReset?: () => void;
  min: number;
  max: number;
  /**
   * Accessible label
   */
  label: string;
}) {
  const [active, setActive] = createSignal(false);

  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    const startX = e.clientX;
    const startWidth = props.width();
    setActive(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const move = (ev: PointerEvent) => {
      const delta = ev.clientX - startX;
      props.onResize(startWidth + (props.edge === "right" ? delta : -delta));
    };

    const up = () => {
      setActive(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", up);
      target.removeEventListener("pointercancel", up);
    };

    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", up);
    target.addEventListener("pointercancel", up);
  }

  function onKeyDown(e: KeyboardEvent) {
    const step = e.shiftKey ? 48 : 16;
    const grow = props.edge === "right" ? "ArrowRight" : "ArrowLeft";
    const shrink = props.edge === "right" ? "ArrowLeft" : "ArrowRight";
    if (e.key === grow) props.onResize(props.width() + step);
    else if (e.key === shrink) props.onResize(props.width() - step);
    else return;
    e.preventDefault();
  }

  return (
    <Handle
      role="separator"
      aria-orientation="vertical"
      aria-label={props.label}
      aria-valuenow={props.width()}
      aria-valuemin={props.min}
      aria-valuemax={props.max}
      tabIndex={0}
      edge={props.edge}
      data-active={active() || undefined}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      onDblClick={() => props.onReset?.()}
    />
  );
}

const Handle = styled("div", {
  base: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "9px",
    zIndex: 2,
    cursor: "col-resize",
    touchAction: "none",
    outline: "none",

    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      bottom: 0,
      left: "4px",
      width: "1px",
      background: "transparent",
      transition: "background var(--caps-dur) var(--caps-ease)",
    },

    "&:hover::after, &[data-active]::after, &:focus-visible::after": {
      background: "var(--caps-accent-line)",
    },

    _phone: {
      display: "none",
    },
  },
  variants: {
    edge: {
      right: { right: "-5px" },
      left: { left: "-5px" },
    },
  },
});
