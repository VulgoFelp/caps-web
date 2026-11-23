import {
  ComponentProps,
  For,
  JSX,
  Match,
  Show,
  Switch,
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  splitProps,
} from "solid-js";

import { cva } from "styled-system/css";
import { styled } from "styled-system/jsx";

import MdChevronRight from "@material-design-icons/svg/outlined/chevron_right.svg?component-solid";
import MdContentCopy from "@material-design-icons/svg/outlined/content_copy.svg?component-solid";
import MdKeyboardDown from "@material-design-icons/svg/outlined/keyboard_arrow_down.svg?component-solid";
import MdOpenInNew from "@material-design-icons/svg/outlined/open_in_new.svg?component-solid";

import { OverflowingText, iconSize } from "../utils";

import { Radio2 } from "./Radio";
import { Ripple } from "./Ripple";

/**
 * Permissible actions
 */
type Action =
  | "chevron"
  | "collapse"
  | "external"
  | "edit"
  | "copy"
  | JSX.Element;

export interface Props {
  readonly icon?: JSX.Element | "blank";
  readonly children?: JSX.Element;
  readonly description?: JSX.Element;

  readonly disabled?: boolean;
  readonly onClick?: () => void;
  readonly action?: Action | Action[];

  readonly roundedIcon?: boolean;
  readonly iconBackground?: boolean;

  readonly variant?: "filled" | "tonal" | "tertiary" | "tertiaryAlt";

  readonly ignoreClick?: boolean;
}

/**
 * Category Button
 */
export function CategoryButton(props: Props) {
  return (
    <Base
      variant={props.variant}
      isLink={!!props.onClick}
      disabled={props.disabled}
      aria-disabled={props.disabled}
      onClick={(e: Event) => {
        // Disable action when button is disabled
        if (props.disabled || props.ignoreClick) return;

        // Prevent propagation when action is called
        e.preventDefault();
        props.onClick?.();
      }}
    >
      <Ripple />

      <Show when={props.icon !== "blank"}>
        <IconWrapper
          rounded={props.roundedIcon}
          transparent={props.iconBackground === false}
        >
          {props.icon}
        </IconWrapper>
      </Show>

      <Show when={props.icon === "blank"}>
        <BlankIconWrapper />
      </Show>

      <Content>
        <Show when={props.children}>
          <OverflowingText>{props.children}</OverflowingText>
        </Show>
        <Show when={props.description}>
          <Description>{props.description}</Description>
        </Show>
      </Content>
      <For each={Array.isArray(props.action) ? props.action : [props.action]}>
        {(action) => (
          <Switch fallback={action}>
            <Match when={action === "chevron"}>
              <Action>
                <MdChevronRight {...iconSize(18)} />
              </Action>
            </Match>
            <Match when={action === "collapse"}>
              <Action>
                <MdKeyboardDown {...iconSize(18)} />
              </Action>
            </Match>
            <Match when={action === "external"}>
              <Action>
                <MdOpenInNew {...iconSize(18)} />
              </Action>
            </Match>
            <Match when={action === "copy"}>
              <Action>
                <MdContentCopy {...iconSize(18)} />
              </Action>
            </Match>
          </Switch>
        )}
      </For>
    </Base>
  );
}

/**
 * Base container for button
 */
const Base = styled("a", {
  base: {
    // for <Ripple />:
    position: "relative",

    gap: "var(--caps-space-5)",
    minHeight: "52px",
    padding: "var(--caps-space-4) var(--caps-space-5)",
    borderRadius: "var(--caps-radius-md)",

    userSelect: "none",
    cursor: "pointer",
    transition: "background-color var(--caps-dur-fast) var(--caps-ease)",

    display: "flex",
    alignItems: "center",
    flexDirection: "row",

    color: "var(--color)",
    fill: "var(--color)",

    "--md-ripple-hover-opacity": "0",
    "--md-ripple-pressed-opacity": "0.05",
  },
  variants: {
    variant: {
      filled: {
        background: "var(--caps-accent)",
        "--color": "var(--caps-on-accent)",
      },
      tonal: {
        background: "var(--caps-bg-raised)",
        boxShadow: "inset 0 0 0 1px var(--caps-line-soft)",
        "--color": "var(--caps-text)",
      },
      tertiary: {
        background: "var(--caps-mention-soft)",
        boxShadow: "inset 0 0 0 1px rgba(240, 180, 90, 0.25)",
        "--color": "var(--caps-text)",
        "--mdui-color-primary": "240, 180, 90",
      },
      tertiaryAlt: {
        background: "var(--caps-mention)",
        "--color": "#2e1d02",
        "--mdui-color-primary": "46, 29, 2",
      },
    },
    isLink: {
      true: {
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "var(--caps-bg-overlay)",
        },
      },
      false: {
        cursor: "initial",
      },
    },
    disabled: {
      true: {
        cursor: "not-allowed",
        opacity: 0.5,
      },
    },
  },
  defaultVariants: {
    variant: "tonal",
  },
});

/**
 * Title and description styles
 */
const Content = styled("div", {
  base: {
    display: "flex",
    flexGrow: 1,
    flexDirection: "column",

    fontWeight: 500,
    fontSize: "var(--caps-text-base)",
    lineHeight: 1.35,
    gap: "2px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
});

/**
 * Accented wrapper for the category button icons
 */
const IconWrapper = styled("div", {
  base: {
    color: "var(--caps-text-2)",
    fill: "var(--caps-text-2)",
    background: "var(--caps-bg-inset)",
    boxShadow: "inset 0 0 0 1px var(--caps-line-soft)",

    width: "32px",
    height: "32px",
    display: "flex",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",

    "& svg": {
      width: "18px",
      height: "18px",
    },
  },
  variants: {
    rounded: {
      true: {
        borderRadius: "var(--caps-radius-md)",
      },
      false: {
        borderRadius: "var(--caps-radius-md)",
      },
    },
    transparent: {
      true: {
        background: "transparent",
        boxShadow: "none",
      },
    },
  },
  defaultVariants: {
    rounded: true,
  },
});

/**
 * Category button icon wrapper for the blank state
 */
const BlankIconWrapper = styled(IconWrapper, {
  base: {
    background: "transparent",
    boxShadow: "none",
  },
});

/**
 * Description shown below title
 */
const Description = styled("span", {
  base: {
    fontSize: "var(--caps-text-sm)",
    fontWeight: 400,
    lineHeight: 1.4,
    color: "var(--caps-text-3)",

    textWrap: "wrap",

    "& a": {
      color: "var(--caps-accent-text)",
    },

    "& a:hover": {
      textDecoration: "underline",
    },
  },
});

/**
 * Container for action icons
 */
const Action = styled("div", {
  base: {
    width: "20px",
    height: "20px",
    flexShrink: 0,
    color: "var(--caps-text-3)",
    fill: "var(--caps-text-3)",

    display: "grid",
    placeItems: "center",
  },
});

/**
 * Group a set of category buttons
 *
 * Rendered as one bordered list with hairline dividers instead of a stack of
 * separate cards.
 */
CategoryButton.Group = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",

    borderRadius: "var(--caps-radius-lg)",
    background: "var(--caps-bg-raised)",
    boxShadow: "inset 0 0 0 1px var(--caps-line-soft)",
    overflow: "hidden",

    "& > *, & > * > a, & > details > summary > a": {
      borderRadius: "0 !important",
      boxShadow: "none !important",
    },

    "& > * + *": {
      borderTop: "1px solid var(--caps-line-soft)",
    },
  },
});

type CollapseProps = Omit<
  ComponentProps<typeof CategoryButton>,
  "onClick" | "children"
> & {
  children?: JSX.Element;
  title?: JSX.Element;

  scrollable?: boolean;
};

const MAX_HEIGHT = 340;

/**
 * Category button with collapsed children
 */
CategoryButton.Collapse = (props: CollapseProps) => {
  const [_, remote] = splitProps(props, ["action", "children"]);

  const [opened, setOpened] = createSignal(false);
  let column: HTMLDivElement | undefined;

  //Toggle the opened state and scroll to the beginning of contents
  const toggleOpened = () => {
    const open = !opened();
    if (open) column?.scroll({ top: 0 });
    setOpened(open);
  };

  //Recalculate the column height for transition
  const updatedHeight = createMemo(() => {
    const height = opened()
      ? Math.min(column?.scrollHeight || 0, MAX_HEIGHT)
      : 0;
    return `${height}px`;
  });

  return (
    <Details onClick={toggleOpened} class={opened() ? "open" : undefined}>
      <summary>
        <CategoryButton
          {...remote}
          action={[props.action, "collapse"].flat()}
          onClick={() => void 0}
        >
          {props.title}
        </CategoryButton>
      </summary>
      <Switch
        fallback={
          <div
            class={innerColumn({ static: true })}
            ref={column!}
            style={{ height: updatedHeight() }}
          >
            {props.children}
          </div>
        }
      >
        <Match when={props.scrollable}>
          <div
            ref={column!}
            style={{ height: updatedHeight() }}
            use:scrollable={{ class: innerColumn() }}
          >
            {props.children}
          </div>
        </Match>
      </Switch>
    </Details>
  );
};

export type CategorySelectOption = Omit<
  ComponentProps<typeof CategoryButton>,
  "onClick" | "children"
> &
  (
    | {
        title: JSX.Element;
        shortDesc?: JSX.Element;
      }
    | {
        title?: JSX.Element;
        shortDesc: JSX.Element;
      }
  );

type SelectProps<T extends string> = Omit<
  ComponentProps<typeof CategoryButton>,
  "onClick" | "children" | "description"
> & {
  title?: JSX.Element;
  options: { [k in T]: CategorySelectOption };
  value?: T;
  onUpdate: (v: T) => void;
};

/**
 * Select dropdown with options from a dictionary
 */
CategoryButton.Select = <T extends string>(props: SelectProps<T>) => {
  const [_, remote] = splitProps(props, [
    "action",
    "options",
    "value",
    "onUpdate",
  ]);

  const [opened, setOpened] = createSignal(false);
  let column: HTMLDivElement | undefined, lastVal: T;

  const opts = createMemo(() => Object.keys(props.options) as T[]);

  const [value, setValue] = createSignal(undefined as unknown as T);

  //Update if props.value changes, but don't run onUpdate
  createRenderEffect(() => {
    //@ts-expect-error Type check breaks
    setValue((lastVal = props.value ?? opts()[0]));
  });

  //Send user input to onUpdate
  createEffect(() => {
    const val = value();
    if (val !== lastVal) props.onUpdate((lastVal = val));
  });

  //Toggle the opened state and scroll to the beginning of contents
  const toggleOpened = () => {
    const open = !opened();
    if (open && column && column.scrollHeight > MAX_HEIGHT)
      column.children[opts().indexOf(value())]?.scrollIntoView();
    setOpened(open);
  };

  //Recalculate the column height for transition
  const updatedHeight = createMemo(() => {
    const height = opened()
      ? Math.min(column?.scrollHeight || 0, MAX_HEIGHT)
      : 0;
    return `${height}px`;
  });

  return (
    <Details onClick={toggleOpened} class={opened() ? "open" : undefined}>
      <summary>
        <CategoryButton
          {...remote}
          description={(() => {
            const opt = props.options[value()];
            if (opt) return opt.shortDesc ?? opt.description ?? opt.title;
          })()}
          action={[props.action, "collapse"].flat()}
          onClick={() => void 0}
        >
          {props.title}
        </CategoryButton>
      </summary>
      <div
        ref={column!}
        style={{ height: updatedHeight() }}
        use:scrollable={{ class: innerColumn() }}
      >
        <For each={opts()}>
          {(val) => (
            <CategoryButton
              icon="blank"
              variant={value() === val ? "tertiaryAlt" : "tertiary"}
              action={<Radio2.Option checked={value() === val} />}
              //@ts-expect-error Type check breaks
              onClick={() => setValue(val)}
              {...props.options[val]}
            >
              {props.options[val].title ?? props.options[val].shortDesc}
            </CategoryButton>
          )}
        </For>
      </div>
    </Details>
  );
};

/**
 * Column with inner content
 */
const innerColumn = cva({
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "1px",

    borderRadius: "var(--caps-radius-md)",
    transition: "var(--caps-dur-slow) var(--caps-ease)",

    scrollbarWidth: "none",
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
  variants: {
    static: {
      true: {
        overflow: "hidden",
      },
    },
  },
});

/**
 * Parent base component
 */
const Details = styled("div", {
  base: {
    "&:not(.open) .InnerColumn": {
      opacity: 0,
      pointerEvents: "none",
    },

    /* add transition to the icon */
    "& summary div:last-child svg": {
      transition: "transform var(--caps-dur) var(--caps-ease)",
    },

    /* rotate chevron when it is open */
    "&.open summary div:last-child svg": {
      transform: "rotate(180deg)",
    },

    /* add additional padding between top button and children when it is open */
    "&.open summary": {
      marginBottom: "var(--gap-xs)",
    },

    /* hide the default details component marker */
    "& summary": {
      transition: "var(--caps-dur) var(--caps-ease)",
      listStyle: "none",
    },

    "& summary::marker, summary::-webkit-details-marker": {
      display: "none",
    },

    /* connect elements vertically */
    // "& > :not(summary) .CategoryButton": {
    //   /* and set child backgrounds */
    //   background: "var(--unset-bg)",
    // },
  },
});
