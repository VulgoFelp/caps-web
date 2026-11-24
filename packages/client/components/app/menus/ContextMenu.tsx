import { useFloating } from "solid-floating-ui";
import {
  Component,
  ComponentProps,
  createSignal,
  JSX,
  Show,
  splitProps,
} from "solid-js";
import { Portal } from "solid-js/web";
import { Motion, Presence } from "solid-motionone";

import { autoUpdate, offset, shift } from "@floating-ui/dom";
import { styled } from "styled-system/jsx";

import { iconSize, symbolSize, Text, useActionSheet } from "@revolt/ui";

import MdChevronRight from "lucide-solid/icons/chevron-right";

const Base = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "1px",
    minWidth: "208px",
    padding: "var(--caps-space-2)",
    overflow: "hidden",
    borderRadius: "var(--caps-radius-lg)",
    background: "var(--caps-bg-overlay)",
    color: "var(--caps-text)",
    fill: "var(--caps-text)",
    boxShadow: "var(--caps-shadow-pop)",

    userSelect: "none",
  },
});

export function ContextMenu(props: ComponentProps<typeof Base>) {
  return (
    <Base
      // prevent context menu closing itself before click event
      onpointerdown={(e) => e.stopImmediatePropagation()}
      {...props}
    />
  );
}

export const ContextMenuDivider = styled("div", {
  base: {
    height: "1px",
    margin: "var(--caps-space-2) var(--caps-space-3)",
    background: "var(--caps-line-soft)",
  },
});

export const ContextMenuItem = styled("a", {
  base: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    minHeight: "30px",
    padding: "0 var(--caps-space-4)",
    borderRadius: "var(--caps-radius-sm)",
    fontSize: "var(--caps-text-md)",
    fontWeight: 500,
    transition: "background-color var(--caps-dur-fast) var(--caps-ease)",

    "& > svg, & > span[aria-hidden='true']": {
      color: "var(--caps-text-3)",
      fill: "var(--caps-text-3)",
      transition: "color var(--caps-dur-fast) var(--caps-ease)",
    },

    "&:hover": {
      background: "var(--caps-hover)",
    },

    "&:hover > svg, &:hover > span[aria-hidden='true']": {
      color: "var(--caps-text)",
      fill: "var(--caps-text)",
    },

    // Touch devices have no hover, so provide feedback while pressing
    "&:active": {
      background: "var(--caps-active)",
    },

    // let the label fill the row, but not <Symbol> icons (also spans)
    "& span:not([aria-hidden='true'])": {
      flexGrow: 1,
    },
  },
  variants: {
    selected: {
      true: {
        background: "var(--caps-selected)",
      },
      false: {},
    },
    action: {
      true: {
        cursor: "pointer",
      },
    },
    button: {
      true: {
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      },
    },
    _titleCase: {
      true: {},
      false: {},
    },
    destructive: {
      true: {
        fill: "var(--caps-danger)",
        color: "var(--caps-danger)",

        "& > svg, & > span[aria-hidden='true']": {
          color: "var(--caps-danger)",
          fill: "var(--caps-danger)",
        },

        "&:hover": {
          background: "var(--caps-danger-soft)",
        },

        "&:hover > svg, &:hover > span[aria-hidden='true']": {
          color: "var(--caps-danger)",
          fill: "var(--caps-danger)",
        },
      },
    },
  },
  defaultVariants: {
    // CAPS: sentence case reads naturally in Portuguese
    _titleCase: false,
    selected: false,
  },
  compoundVariants: [
    {
      _titleCase: true,
      button: true,
      css: {
        textTransform: "capitalize",
      },
    },
  ],
});

type ButtonProps = ComponentProps<typeof ContextMenuItem> & {
  icon?: JSX.Element | Component<JSX.SvgSVGAttributes<SVGSVGElement>>;
  symbol?: JSX.Element | Component<JSX.SvgSVGAttributes<SVGSVGElement>>;
  destructive?: boolean;
  actionIcon?: JSX.Element | Component<JSX.SvgSVGAttributes<SVGSVGElement>>;
  actionSymbol?: JSX.Element | Component<JSX.SvgSVGAttributes<SVGSVGElement>>;
};

export function ContextMenuButton(props: ButtonProps) {
  const [local, remote] = splitProps(props, [
    "icon",
    "symbol",
    "actionIcon",
    "actionSymbol",
    "children",
  ]);

  return (
    <ContextMenuItem button {...remote}>
      {typeof local.icon === "function"
        ? local.icon?.(iconSize(16))
        : local.icon}
      {typeof local.symbol === "function"
        ? local.symbol(symbolSize(16))
        : local.symbol}
      <Text class="label" size="large">
        {local.children}
      </Text>
      {typeof local.actionIcon === "function"
        ? local.actionIcon?.(iconSize(16))
        : local.actionIcon}
      {typeof local.actionSymbol === "function"
        ? local.actionSymbol(symbolSize(16))
        : local.actionSymbol}
    </ContextMenuItem>
  );
}

export function ContextMenuSubMenu(
  props: Omit<
    ButtonProps,
    "ref" | "onClick" | "onMouseEnter" | "onMouseLeave"
  > & {
    buttonContent: JSX.Element;
    onClick?: () => void;
  },
) {
  const [anchor, setAnchor] = createSignal<HTMLDivElement>();
  const [ref, setRef] = createSignal<HTMLDivElement>();

  const [show, setShow] = createSignal<"hide" | "show" | boolean>(false);
  const [local, buttonProps] = splitProps(props, [
    "children",
    "buttonContent",
    "onClick",
  ]);

  const sheet = useActionSheet();

  function isShowing() {
    return show() === true || show() === "show";
  }

  const position = useFloating(anchor, ref, {
    placement: "right-start",
    whileElementsMounted: autoUpdate,
    middleware: [offset(5), shift()],
  });

  return (
    <>
      <ContextMenuButton
        ref={setAnchor}
        selected={isShowing()}
        actionIcon={MdChevronRight}
        onpointerdown={(e) => {
          e.stopImmediatePropagation();
        }}
        onClick={(e) => {
          // mobile: always drill down, the shortcut becomes the first row of the page
          if (sheet) {
            e.stopImmediatePropagation();
            sheet.push({
              title: () => local.buttonContent,
              content: () => (
                <>
                  <Show when={local.onClick}>
                    <ContextMenuButton onClick={() => local.onClick!()}>
                      {local.buttonContent}
                    </ContextMenuButton>
                    <ContextMenuDivider />
                  </Show>
                  {local.children}
                </>
              ),
            });
            return;
          }

          if (local.onClick) {
            local.onClick();
          } else {
            e.stopImmediatePropagation();
            setShow(isShowing() ? false : "show");
          }
        }}
        onMouseEnter={() => {
          if (sheet) return;
          setShow((show) => (show === "hide" ? show : true));
        }}
        {...buttonProps}
      >
        {local.buttonContent}
      </ContextMenuButton>
      <Show
        when={!sheet}
        fallback={
          <Show when={isShowing()}>
            <div style={{ "padding-inline-start": "var(--gap-lg)" }}>
              {local.children}
            </div>
          </Show>
        }
      >
        <Portal mount={document.getElementById("floating")!}>
          <Presence>
            <Show when={isShowing()}>
              <Motion
                ref={setRef}
                style={{
                  position: position.strategy,
                  top: `${position.y ?? 0}px`,
                  left: `${position.x ?? 0}px`,
                  "z-index": 1000,
                }}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, easing: [0.87, 0, 0.13, 1] }}
                onMouseLeave={() =>
                  setShow((show) => (show === true ? false : show))
                }
                // stop submenu from closing context menu
                onpointerdown={(e) => e.stopImmediatePropagation()}
              >
                <div
                  onClick={(e) => {
                    if (local.onClick) {
                      local.onClick();
                    } else {
                      // prevent submenu trigger from closing context menu
                      e.stopImmediatePropagation();
                      setShow((show) => (show ? "hide" : true));
                    }
                  }}
                  // float a virtual element to ensure the mouseLeave event covers
                  // both the anchor/button we attached to and the newly created context menu
                  style={{
                    position: "fixed",
                    top: 0,
                    left: `-${(anchor()?.clientWidth ?? 0) + 5}px`,
                    width: `${(anchor()?.clientWidth ?? 0) + 5}px`,
                    height: `${anchor()?.clientHeight ?? 0}px`,
                    cursor: "pointer",
                  }}
                />
                <ContextMenu>{local.children}</ContextMenu>
              </Motion>
            </Show>
          </Presence>
        </Portal>
      </Show>
    </>
  );
}
