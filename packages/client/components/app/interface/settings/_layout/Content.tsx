import { Accessor, JSX, Setter, Show } from "solid-js";
import { Motion, Presence } from "solid-motionone";

import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { Breadcrumbs, IconButton, Text } from "@revolt/ui";

import MdClose from "@material-design-icons/svg/outlined/close.svg?component-solid";

import { SettingsList } from "..";
import { useSettingsNavigation } from "../Settings";

/**
 * Content portion of the settings menu
 */
export function SettingsContent(props: {
  onClose?: () => void;
  children: JSX.Element;
  list: Accessor<SettingsList<unknown>>;
  title: (ctx: SettingsList<never>, key: string) => string;
  page: Accessor<string | undefined>;
  ref: Setter<HTMLDivElement | undefined>;
  action: Accessor<(() => JSX.Element) | undefined>;
}) {
  const { navigate } = useSettingsNavigation();
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div ref={props.ref} use:scrollable={{ class: base }}>
      <Show when={props.page()}>
        <InnerContent class="settings_cont">
          <InnerColumn>
            <Show when={props.page() !== "account"}>
              <Text class="headline" size="medium">
                <Breadcrumbs
                  elements={props.page()!.split("/")}
                  renderElement={(key) =>
                    props.title(props.list() as SettingsList<never>, key)
                  }
                  navigate={(keys) => navigate(keys.join("/"))}
                />
              </Text>
            </Show>
            {props.children}
            <div class={css({ minHeight: "80px" })} />
          </InnerColumn>
        </InnerContent>
      </Show>
      <ActionRail>
        <Show when={props.onClose}>
          <CloseAction class="close">
            <IconButton variant="tonal" onPress={props.onClose}>
              <MdClose />
            </IconButton>
          </CloseAction>
        </Show>
        <FloatingActions>
          <Presence>
            <Show when={props.action()} keyed>
              {(renderAction) => (
                <Motion.div
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.8,
                    transition: {
                      duration: reduceMotion ? 0 : 0.2,
                      easing: [0.3, 0, 0.8, 0.15],
                    },
                  }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.3,
                    easing: [0.05, 0.7, 0.1, 1],
                  }}
                  style={{ "transform-origin": "center" }}
                >
                  {renderAction()}
                </Motion.div>
              )}
            </Show>
          </Presence>
        </FloatingActions>
      </ActionRail>
    </div>
  );
}

/**
 * Base styles
 */
const base = css({
  minWidth: 0,
  flex: "1 1 800px",
  flexDirection: "row",
  display: "flex",
  background: "var(--caps-bg-app)",
  borderInlineStart: "1px solid var(--caps-line-soft)",

  "& > a": {
    textDecoration: "none",
  },

  _phone: {
    borderInlineStart: "none",
  },

  _tablet: {
    // prevent the fixed action rail from scroll with this element instead of the viewport
    willChange: "auto !important",
  },
});

const InnerContent = styled("div", {
  base: {
    minWidth: 0,
    width: "100%",
    display: "flex",
    maxWidth: "720px",
    padding: "56px 40px",
    justifyContent: "stretch",
    zIndex: 1,

    _tablet: { padding: "16px" },
    _phone: { height: "100%" },
  },
});

const InnerColumn = styled("div", {
  base: {
    width: "100%",
    gap: "var(--caps-space-5)",
    display: "flex",
    flexDirection: "column",
    marginBlockEnd: "80px",

    // page title
    "& > span:first-child": {
      paddingBottom: "var(--caps-space-5)",
      marginBottom: "var(--caps-space-2)",
      borderBottom: "1px solid var(--caps-line-soft)",
    },
  },
});

const ActionRail = styled("div", {
  base: {
    height: "100%",
    minWidth: "56px",
    padding: "56px 12px var(--caps-space-9)",

    zIndex: 2,
    flexGrow: 1,
    flexShrink: 0,
    alignSelf: "flex-start",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,

    _tablet: {
      position: "fixed",
      insetInlineEnd: 0,
      height: "100dvh",
      padding: "12px",
      paddingBlockStart: "calc(12px + var(--inset-top))",
      paddingInlineEnd: "calc(12px + var(--inset-right))",
      paddingBlockEnd: "calc(12px + var(--inset-bottom))",
      alignItems: "flex-end",
      justifyContent: "flex-end",
      pointerEvents: "none",

      "& > *": {
        pointerEvents: "auto",
      },
    },
  },
});

const FloatingActions = styled("div", {
  base: {
    height: "fit-content",
  },
});

const CloseAction = styled("div", {
  base: {
    visibility: "visible",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "var(--caps-space-2)",

    "&:after": {
      content: '"ESC"',
      fontWeight: 600,
      letterSpacing: "0.06em",
      color: "var(--caps-text-3)",
      fontSize: "10px",
    },

    _tablet: {
      display: "none",
    },
  },
});
