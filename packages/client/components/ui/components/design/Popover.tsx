import { useFloating } from "solid-floating-ui";
import {
  Accessor,
  JSX,
  Show,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { Portal } from "solid-js/web";

import { Placement, autoUpdate, flip, offset, shift } from "@floating-ui/dom";
import { styled } from "styled-system/jsx";

import { Keybind, KeybindAction } from "@revolt/keybinds";

/**
 * Anchored floating panel (switcher, notifications, profile menu)
 *
 * Closes on outside press and Escape; focus returns to the anchor.
 */
export function Popover(props: {
  anchor: Accessor<HTMLElement | undefined>;
  open: boolean;
  onClose: () => void;
  placement?: Placement;
  /**
   * Fixed width in pixels
   */
  width?: number;
  /**
   * Accessible label of the dialog
   */
  label: string;
  children: JSX.Element;
}) {
  const [ref, setRef] = createSignal<HTMLDivElement>();

  const position = useFloating(() => props.anchor(), ref, {
    placement: props.placement ?? "bottom-start",
    whileElementsMounted: autoUpdate,
    middleware: [offset(6), flip(), shift({ padding: 8 })],
  });

  function onPointerDown(e: PointerEvent) {
    if (!props.open) return;
    const target = e.target as Node;
    if (ref()?.contains(target) || props.anchor()?.contains(target)) return;
    // presses inside other floating layers (context menus, tooltips) keep it open
    if (document.getElementById("floating")?.contains(target)) return;
    props.onClose();
  }

  function onKeyDown(e: KeyboardEvent) {
    if (props.open && e.key === "Escape") {
      e.stopPropagation();
      props.onClose();
      props.anchor()?.focus();
    }
  }

  onMount(() => {
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);
  });
  onCleanup(() => {
    document.removeEventListener("pointerdown", onPointerDown, true);
    document.removeEventListener("keydown", onKeyDown, true);
  });

  return (
    <Show when={props.open}>
      <Portal mount={document.getElementById("floating")!}>
        {/* counts as an open floating layer: blocks type-to-focus-composer */}
        <Keybind
          keybind={KeybindAction.CLOSE_FLOATING}
          onPressed={props.onClose}
        />
        <Panel
          ref={setRef}
          role="dialog"
          aria-label={props.label}
          style={{
            position: position.strategy,
            top: `${position.y ?? 0}px`,
            left: `${position.x ?? 0}px`,
            width: props.width ? `${props.width}px` : undefined,
          }}
        >
          {props.children}
        </Panel>
      </Portal>
    </Show>
  );
}

const Panel = styled("div", {
  base: {
    zIndex: "var(--caps-z-popover)",
    display: "flex",
    flexDirection: "column",
    maxHeight: "min(640px, calc(100vh - 72px))",
    maxWidth: "calc(100vw - 16px)",
    overflow: "hidden",
    color: "var(--caps-text)",
    background: "var(--caps-bg-overlay)",
    borderRadius: "var(--caps-radius-lg)",
    boxShadow: "var(--caps-shadow-pop)",
    animation: "capsPopIn 140ms var(--caps-ease-out)",
    transformOrigin: "top",
  },
});
