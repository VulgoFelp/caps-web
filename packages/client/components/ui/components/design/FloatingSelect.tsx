import { useFloating } from "solid-floating-ui";
import {
  JSX,
  Show,
  children as accessChildren,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  splitProps,
} from "solid-js";
import { Portal } from "solid-js/web";
import { Motion, Presence } from "solid-motionone";

import { autoUpdate, flip, offset, shift, size } from "@floating-ui/dom";
import { MenuItem } from "mdui/components/menu-item";
import { styled } from "styled-system/jsx";

type FloatingSelectPropsLabel =
  | { required: true; label: string }
  | { required?: false; label?: string };

type FloatingSelectProps = FloatingSelectPropsLabel & {
  value?: string;
  disabled?: boolean;
  variant?: "filled" | "outlined";
  children: JSX.Element;
  onChange?: (event: Event & { currentTarget: MenuItem }) => void;
  onOpened?: () => void;
};

/**
 * Custom Select component using floating-ui for proper positioning in modals
 *
 * This component solves the issue where MDUI's mdui-select uses position:fixed
 * which breaks when inside modals with CSS transforms.
 *
 * @see https://github.com/zdhxiong/mdui/issues/296
 */
export function FloatingSelect(props: FloatingSelectProps) {
  const [local, others] = splitProps(props, [
    "value",
    "label",
    "required",
    "disabled",
    "variant",
    "children",
    "onChange",
  ]);

  const [isOpen, setIsOpen] = createSignal(false);
  const [anchor, setAnchor] = createSignal<HTMLButtonElement>();
  const [dropdown, setDropdown] = createSignal<HTMLDivElement>();

  const childrenAccessor = accessChildren(() => local.children);

  const selectedText = () => {
    const items = childrenAccessor.toArray() as MenuItem[];
    const selected = items.find((item: MenuItem) => {
      return !!item.value && item.value === local.value;
    });
    return selected?.textContent || selected?.innerText || "";
  };

  const position = useFloating(anchor, dropdown, {
    placement: "bottom-start",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip(),
      shift({ padding: 8 }),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            minWidth: `${rects.reference.width}px`,
          });
        },
      }),
    ],
  });

  function handleClickOutside(e: MouseEvent) {
    if (!isOpen()) return;

    const target = e.target as Node;
    const anchorEl = anchor();
    const dropdownEl = dropdown();

    if (
      anchorEl &&
      !anchorEl.contains(target) &&
      dropdownEl &&
      !dropdownEl.contains(target)
    ) {
      setIsOpen(false);
    }
  }

  onMount(() => {
    document.addEventListener("mousedown", handleClickOutside);
    if (props.onOpened) createEffect(() => isOpen() && props.onOpened?.());
  });
  onCleanup(() =>
    document.removeEventListener("mousedown", handleClickOutside),
  );

  function handleItemClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const menuItem: MenuItem | undefined =
      target.closest("mdui-menu-item") ??
      (event
        .composedPath()
        .find(
          (el) => el instanceof HTMLElement && el.tagName === "MDUI-MENU-ITEM",
        ) as MenuItem);

    if (menuItem) {
      if (menuItem.value != null && local.onChange) {
        // Create a synthetic event that matches the expected interface
        local.onChange({ ...event, currentTarget: menuItem });
      }
      setIsOpen(false);
    }
  }

  return (
    <>
      <SelectTrigger
        ref={setAnchor}
        type="button"
        open={isOpen()}
        disabled={local.disabled}
        onClick={() => !local.disabled && setIsOpen(!isOpen())}
        {...others}
      >
        <Show when={local.label}>
          <SelectLabel floating={!!local.value || isOpen()}>
            {local.label}
            {local.required && " *"}
          </SelectLabel>
        </Show>
        <SelectValue labeled={!!local.label}>{selectedText()}</SelectValue>
        <ArrowIcon open={isOpen()} viewBox="0 0 24 24">
          <path d="M7 10l5 5 5-5z" />
        </ArrowIcon>
      </SelectTrigger>

      <Portal mount={document.getElementById("floating")!}>
        <Presence>
          <Show when={isOpen()}>
            <Motion
              ref={setDropdown}
              style={{
                position: position.strategy,
                top: `${position.y ?? 0}px`,
                left: `${position.x ?? 0}px`,
                "z-index": "1000",
              }}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.14, easing: [0.16, 1, 0.3, 1] }}
            >
              <DropdownMenu onClick={handleItemClick}>
                {local.children}
              </DropdownMenu>
            </Motion>
          </Show>
        </Presence>
      </Portal>
    </>
  );
}

const SelectTrigger = styled("button", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "var(--caps-space-4)",
    width: "100%",
    minHeight: "var(--caps-h-lg)",
    padding: "0 10px 0 12px",
    borderRadius: "var(--caps-radius-md)",
    border: "none",
    background: "var(--caps-bg-field)",
    boxShadow: "inset 0 0 0 1px var(--caps-line)",
    color: "var(--caps-text)",
    cursor: "pointer",
    position: "relative",
    textAlign: "left",
    fontSize: "var(--caps-text-base)",
    fontFamily: "inherit",
    transition:
      "box-shadow var(--caps-dur) var(--caps-ease), background-color var(--caps-dur) var(--caps-ease)",

    "&:hover": {
      boxShadow: "inset 0 0 0 1px var(--caps-line-strong)",
    },

    "&:focus-visible": {
      outline: "none",
      boxShadow:
        "inset 0 0 0 1px var(--caps-accent), 0 0 0 3px var(--caps-accent-soft)",
    },
  },
  variants: {
    open: {
      true: {
        boxShadow:
          "inset 0 0 0 1px var(--caps-accent), 0 0 0 3px var(--caps-accent-soft)",
        "&:hover": {
          boxShadow:
            "inset 0 0 0 1px var(--caps-accent), 0 0 0 3px var(--caps-accent-soft)",
        },
      },
    },
    disabled: {
      true: {
        cursor: "not-allowed",
        opacity: 0.45,
      },
    },
  },
});

const SelectLabel = styled("label", {
  base: {
    position: "absolute",
    transition:
      "top var(--caps-dur) var(--caps-ease), font-size var(--caps-dur) var(--caps-ease), transform var(--caps-dur) var(--caps-ease)",
    left: "12px",
    color: "var(--caps-text-3)",
    pointerEvents: "none",
    transformOrigin: "left top",
  },
  variants: {
    floating: {
      true: {
        top: "6px",
        fontSize: "var(--caps-text-xs)",
        fontWeight: 500,
        transform: "translateY(0)",
      },
      false: {
        top: "50%",
        fontSize: "var(--caps-text-base)",
        transform: "translateY(-50%)",
      },
    },
  },
});

const SelectValue = styled("span", {
  base: {
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  variants: {
    labeled: {
      true: {
        paddingTop: "18px",
        paddingBottom: "6px",
      },
    },
  },
});

const DropdownMenu = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "1px",
    maxHeight: "40vh",
    overflowY: "auto",
    scrollbarWidth: "thin",
    borderRadius: "var(--caps-radius-lg)",
    background: "var(--caps-bg-overlay)",
    color: "var(--caps-text)",
    boxShadow: "var(--caps-shadow-pop)",
    padding: "4px",

    "& mdui-menu-item": {
      cursor: "pointer",
      padding: "0 10px",
      borderRadius: "var(--caps-radius-sm)",
      transition: "background-color var(--caps-dur-fast) var(--caps-ease)",
      height: "var(--caps-h-md)",
      fontSize: "var(--caps-text-md)",

      "&:hover": {
        background: "var(--caps-hover)",
      },

      "&[selected]": {
        background: "var(--caps-selected)",
      },
    },
  },
});

const ArrowIcon = styled("svg", {
  base: {
    flexShrink: 0,
    width: "20px",
    height: "20px",
    fill: "var(--caps-text-3)",
    transition: "transform var(--caps-dur) var(--caps-ease)",
  },
  variants: {
    open: {
      true: {
        transform: "rotate(180deg)",
      },
    },
  },
});
