import { Match, Show, Switch, createSignal } from "solid-js";

import { Trans } from "@lingui/solid/macro";
import { Motion, Presence } from "solid-motionone";

import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { useClientLifecycle } from "@revolt/client";
import { State, TransitionType } from "@revolt/client/Controller";
import { Button, symbolSize } from "@revolt/ui";

import MdBuild from "@material-symbols/svg-400/outlined/build.svg?component-solid";
import MdClose from "@material-symbols/svg-400/outlined/close.svg?component-solid";
import MdCollapseContent from "@material-symbols/svg-400/outlined/collapse_content.svg?component-solid";
import MdExpandContent from "@material-symbols/svg-400/outlined/expand_content.svg?component-solid";
import MdMinimize from "@material-symbols/svg-400/outlined/minimize.svg?component-solid";

import Wordmark from "../../../../public/assets/web/wordmark.svg?component-solid";
import { pendingUpdate } from "../../../../src/serviceWorkerInterface";

const isMacOS = navigator.platform.startsWith("Mac");
const isNative = !!window.native;

export function Titlebar() {
  const [isMaximised, setIsMaximised] = createSignal(
    isNative ? window.desktopConfig.get().windowState.isMaximised : false,
  );
  const { lifecycle } = useClientLifecycle();

  function isDisconnected() {
    return [
      State.Connecting,
      State.Disconnected,
      State.Reconnecting,
      State.Offline,
    ].includes(lifecycle.state());
  }

  function maximise() {
    window.native.maximise();
    setIsMaximised((t) => !t);
  }

  return (
    <Presence>
      <Show
        when={
          (isNative && window.desktopConfig?.get().customFrame) ||
          isDisconnected()
        }
      >
        <Motion.div
          initial={{ height: 0 }}
          animate={{ height: "32px" }}
          exit={{ height: 0 }}
        >
          <Base disconnected={isDisconnected()}>
            <Title
              macos={isMacOS}
              style={{
                "-webkit-user-select": "none",
                "-webkit-app-region": "drag",
              }}
            >
              <Wordmark
                class={css({
                  height: "13px",
                  width: "auto",
                })}
              />{" "}
              <Show when={import.meta.env.DEV}>
                <MdBuild {...symbolSize(16)} />
              </Show>
            </Title>
            <DragHandle
              macos={isMacOS && isNative}
              style={{
                "-webkit-user-select": "none",
                "-webkit-app-region": "drag",
              }}
            >
              <Switch>
                <Match when={lifecycle.state() === State.Connecting}>
                  <Trans>Connecting…</Trans>
                </Match>
                {/* <Match when={lifecycle.state() === State.Connected}>Connected</Match> */}
                <Match when={lifecycle.state() === State.Disconnected}>
                  <Trans>Disconnected</Trans>
                  <Retry
                    type="button"
                    style={{ "-webkit-app-region": "no-drag" }}
                    onClick={() =>
                      lifecycle.transition({ type: TransitionType.Retry })
                    }
                  >
                    <Trans>Reconnect now</Trans>
                  </Retry>
                </Match>
                <Match when={lifecycle.state() === State.Reconnecting}>
                  <Trans>Reconnecting…</Trans>
                </Match>
                <Match when={lifecycle.state() === State.Offline}>
                  <Trans>You are offline</Trans>
                  <Retry
                    type="button"
                    style={{ "-webkit-app-region": "no-drag" }}
                    onClick={() =>
                      lifecycle.transition({ type: TransitionType.Retry })
                    }
                  >
                    <Trans>Reconnect now</Trans>
                  </Retry>
                </Match>
              </Switch>
              <Show when={pendingUpdate()}>
                {" "}
                <div
                  style={{
                    "-webkit-app-region": "no-drag",
                  }}
                >
                  <Button size="sm" onPress={pendingUpdate()}>
                    <Trans>Update</Trans>
                  </Button>
                </div>
              </Show>
            </DragHandle>
            <Show when={isNative && !isMacOS}>
              <Action onClick={window.native.minimise}>
                <MdMinimize {...symbolSize(18)} />
              </Action>
              <Action onClick={maximise}>
                <Show
                  when={isMaximised()}
                  fallback={<MdExpandContent {...symbolSize(16)} />}
                >
                  <MdCollapseContent {...symbolSize(16)} />
                </Show>
              </Action>
              <Action close onClick={window.native.close}>
                <MdClose {...symbolSize(18)} />
              </Action>
            </Show>
          </Base>
        </Motion.div>
      </Show>
    </Presence>
  );
}

const Base = styled("div", {
  base: {
    flexShrink: 0,
    height: "32px",
    userSelect: "none",

    display: "flex",
    alignItems: "center",

    fontSize: "var(--caps-text-sm)",
    fill: "currentColor",
    transition: "background var(--caps-dur) var(--caps-ease)",
  },
  variants: {
    disconnected: {
      true: {
        color: "var(--caps-text)",
        background: "var(--caps-mention-soft)",
        boxShadow: "inset 0 -1px 0 var(--caps-line-soft)",
      },
      false: {
        color: "var(--caps-text-3)",
        background: "var(--caps-bg-rail)",
      },
    },
  },
});

const Title = styled("div", {
  base: {
    display: "flex",
    gap: "var(--caps-space-3)",
    alignItems: "center",
    paddingInlineStart: "var(--caps-space-5)",

    color: "var(--caps-text)",
  },
  variants: {
    macos: {
      true: {
        order: 1,
        paddingInlineEnd: "var(--caps-space-5)",
      },
    },
  },
});

const DragHandle = styled("div", {
  base: {
    flexGrow: 1,
    height: "100%",

    display: "flex",
    gap: "var(--caps-space-4)",
    alignItems: "center",
    paddingInlineStart: "var(--caps-space-5)",

    fontWeight: 500,
  },
  variants: {
    macos: {
      true: {
        marginInlineStart: "70px",
      },
    },
  },
});

const Retry = styled("button", {
  base: {
    all: "unset",
    cursor: "pointer",
    fontWeight: 600,
    color: "var(--caps-text)",
    textDecoration: "underline",
    textUnderlineOffset: "2px",
    textDecorationColor: "var(--caps-line-strong)",

    "&:hover": {
      textDecorationColor: "currentColor",
    },
  },
});

const Action = styled("a", {
  base: {
    cursor: "pointer",
    position: "relative",

    display: "grid",
    placeItems: "center",

    height: "100%",
    width: "46px",
    color: "var(--caps-text-2)",
    transition:
      "background var(--caps-dur-fast) var(--caps-ease), color var(--caps-dur-fast) var(--caps-ease)",

    "&:hover": {
      background: "var(--caps-hover)",
      color: "var(--caps-text)",
    },
    "&:active": {
      background: "var(--caps-active)",
    },
  },
  variants: {
    close: {
      true: {
        "&:hover": {
          background: "#c42b1c",
          color: "#fff",
        },
        "&:active": {
          background: "#a52617",
          color: "#fff",
        },
      },
    },
  },
});
