import {
  createEffect,
  createMemo,
  createSignal,
  JSX,
  on,
  onCleanup,
  onMount,
  Show,
} from "solid-js";

import { Trans } from "@lingui/solid/macro";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { Titlebar } from "@revolt/app/interface/desktop/Titlebar";
import {
  ContextMenu,
  ContextMenuButton,
  ContextMenuDivider,
} from "@revolt/app/menus/ContextMenu";
import { useClientLifecycle } from "@revolt/client";
import { State } from "@revolt/client/Controller";
import { useModals } from "@revolt/modal";
import { A, useLocation } from "@revolt/routing";
import { useState } from "@revolt/state";
import { IconButton, Symbol } from "@revolt/ui";

import IconArrowLeft from "lucide-solid/icons/arrow-left";
import Wordmark from "../../../public/assets/web/wordmark.svg?component-solid";
import heroArt from "./caps-hero.svg?url";
import { BubbleMood, BubbleProvider, FlowBase, FlowBubble } from "./flows/Flow";

import GitHub from "./flows/github.svg?component-solid";

const root = css({
  width: "100%",
  height: "100%",
  minHeight: 0,
  color: "var(--caps-text)",
  background: "var(--caps-bg-app)",
});

const Page = styled("main", {
  base: {
    boxSizing: "border-box",
    display: "grid",
    gridTemplateColumns: "minmax(420px, 0.92fr) minmax(500px, 1.08fr)",
    gap: "clamp(18px, 3vw, 48px)",
    width: "100%",
    height: "100%",
    minHeight: "620px",
    padding: "clamp(18px, 2.5vw, 36px)",

    "@media (max-width: 980px)": {
      gridTemplateColumns: "minmax(320px, 0.78fr) minmax(440px, 1.22fr)",
      gap: "18px",
      padding: "18px",
    },

    "@media (max-width: 900px)": {
      display: "block",
      height: "auto",
      minHeight: "calc(100% - 32px)",
      padding: 0,
    },
  },
});

const Hero = styled("section", {
  base: {
    position: "relative",
    isolation: "isolate",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    overflow: "hidden",
    padding: "40px",
    color: "#ecebe4",
    // CAPS hero: graphite with the lime spiral, anchored bottom-left
    background: "#0c0c0b var(--hero) left bottom / cover no-repeat",
    borderRadius: "var(--caps-radius-xl, 16px)",
    boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.05)",

    "@media (max-width: 980px)": {
      padding: "38px",
    },

    "@media (max-width: 900px)": {
      display: "none",
    },
  },
});

const Brand = styled("div", {
  base: {
    position: "relative",
    zIndex: 1,
    width: "112px",
    height: "auto",

    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-4)",

    "& > svg": {
      width: "100%",
      height: "auto",
      fill: "currentColor",
    },
  },
  variants: {
    header: {
      true: {
        width: "auto",

        "& svg": {
          display: "none",

          "@media (max-width: 900px)": {
            display: "block",
            width: "96px",
            color: "var(--caps-text)",
          },

          "@media (max-width: 460px)": {
            width: "92px",
          },
        },
      },
    },
  },
});

const Content = styled("section", {
  base: {
    display: "grid",
    gridTemplateRows: "auto minmax(0, 1fr) auto",
    minWidth: 0,
    minHeight: 0,
    padding: "8px clamp(12px, 2.5vw, 42px) 4px",

    "@media (max-width: 980px)": {
      paddingInline: "20px",
    },

    "@media (max-width: 900px)": {
      minHeight: "calc(100vh - 32px)",
      padding: "20px clamp(20px, 6vw, 44px) 14px",
    },

    "@media (max-width: 460px)": {
      paddingInline: "20px",
    },
  },
});

const Topbar = styled("header", {
  base: {
    display: "flex",
    alignItems: "center",
    minHeight: "48px",
    justifyContent: "space-between",
  },
});

const AccountSwitch = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-4)",
    fontSize: "var(--caps-text-md)",
    whiteSpace: "nowrap",

    "& > span": {
      color: "var(--caps-text-3)",
    },

    "& a": {
      display: "flex",
      alignItems: "center",
      padding: "0 12px",
      height: "var(--caps-h-md)",
      color: "var(--caps-text)",
      background: "var(--caps-bg-raised)",
      boxShadow: "inset 0 0 0 1px var(--caps-line)",
      borderRadius: "var(--caps-radius-md)",
      fontWeight: 600,
      textDecoration: "none",
      transition:
        "background-color var(--caps-dur-fast) var(--caps-ease), box-shadow var(--caps-dur-fast) var(--caps-ease)",
    },

    "& a:hover": {
      background: "var(--caps-bg-overlay)",
      boxShadow: "inset 0 0 0 1px var(--caps-line-strong)",
    },

    "@media (max-width: 900px)": {
      "& > span": { display: "none" },
    },
  },
});

const flowWrap = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 0,
  overflowY: "auto",
  padding: "32px 0",

  "@media (max-width: 900px)": {
    padding: "42px 0",
  },
});

const FlowStack = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
    maxWidth: "440px",
    margin: "auto 0",
  },
});

const Footer = styled("footer", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: "42px",
    color: "var(--caps-text-3)",
    fontSize: "var(--caps-text-sm)",

    "& nav": {
      display: "flex",
      alignItems: "center",
      gap: "18px",
    },

    "& a": {
      color: "inherit",
      textDecoration: "none",
    },

    "& a:hover": {
      color: "var(--caps-text)",
    },

    "@media (max-width: 460px)": {
      flexDirection: "column",
      gap: "14px",
      paddingTop: "12px",
    },
  },
});

const Socials = styled("nav", {
  base: {
    "& a": {
      display: "grid",
      height: "28px",
      placeItems: "center",
    },

    "& svg": {
      color: "inherit",
    },
  },
});

let hasMountedAuthFlow = false;

/**
 * How long after the last keystroke the bubble keeps showing typing
 */
const TYPING_IDLE_MS = 1000;

/**
 * How long the bubble shows an error before settling again
 */
const ERROR_FLASH_MS = 900;

/**
 * How long the bubble shows a success before settling again
 */
const SUCCESS_FLASH_MS = 1400;

/**
 * Shared layout for every logged-out account flow.
 */
export function AuthPage(props: { children: JSX.Element }) {
  const state = useState();
  const location = useLocation();
  const { lifecycle } = useClientLifecycle();
  const { openModal } = useModals();

  const isCreate = () => location.pathname.includes("/login/create");

  const [typing, setTyping] = createSignal(false);
  const [pendingSubmits, setPendingSubmits] = createSignal(0);
  const [erroring, setErroring] = createSignal(false);
  const [succeeding, setSucceeding] = createSignal(false);
  const [errorCount, setErrorCount] = createSignal(0);
  let typingTimer: ReturnType<typeof setTimeout> | undefined;
  let errorTimer: ReturnType<typeof setTimeout> | undefined;
  let successTimer: ReturnType<typeof setTimeout> | undefined;

  onCleanup(() => {
    clearTimeout(typingTimer);
    clearTimeout(errorTimer);
    clearTimeout(successTimer);
  });

  // most important first: errors, waiting on the server, success, typing
  const bubbleMood = createMemo<BubbleMood>(() => {
    if (erroring()) return "error";
    if (pendingSubmits() > 0 || lifecycle.state() === State.LoggingIn)
      return "submitting";
    if (succeeding()) return "success";
    if (typing()) return "typing";
    return "idle";
  });

  const bubbleControls = {
    beginSubmit() {
      setPendingSubmits((count) => count + 1);

      let finished = false;
      return () => {
        if (finished) return;
        finished = true;
        setPendingSubmits((count) => count - 1);
      };
    },
    flashError() {
      clearTimeout(successTimer);
      setSucceeding(false);
      setErroring(true);
      setErrorCount((count) => count + 1);
      clearTimeout(errorTimer);
      errorTimer = setTimeout(() => setErroring(false), ERROR_FLASH_MS);
    },
    flashSuccess() {
      clearTimeout(errorTimer);
      setErroring(false);
      setSucceeding(true);
      clearTimeout(successTimer);
      successTimer = setTimeout(() => setSucceeding(false), SUCCESS_FLASH_MS);
    },
  };

  /**
   * Dev-only: keep typing for a couple of seconds
   */
  function debugType() {
    const smash = setInterval(onFlowInput, 150);
    setTimeout(() => clearInterval(smash), 2000);
  }

  /**
   * Dev-only: pretend the server takes a while to answer
   */
  function debugSubmit() {
    setTimeout(bubbleControls.beginSubmit(), 2500);
  }

  /**
   * Dev-only: play every mood back to back
   */
  function debugChaos() {
    onFlowInput();
    setTimeout(() => {
      const finish = bubbleControls.beginSubmit();
      setTimeout(() => {
        finish();
        bubbleControls.flashError();
        setTimeout(() => {
          const finishAgain = bubbleControls.beginSubmit();
          setTimeout(() => {
            finishAgain();
            bubbleControls.flashSuccess();
          }, 1500);
        }, 800);
      }, 1500);
    }, 900);
  }

  /**
   * Treat any input inside the current flow as typing
   */
  function onFlowInput() {
    setTyping(true);
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => setTyping(false), TYPING_IDLE_MS);
  }
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let flowElement: HTMLDivElement | undefined;
  let bubbleElement: HTMLDivElement | undefined;
  let activeFlowAnimation: Animation | undefined;
  let activeBubbleAnimation: Animation | undefined;
  let bubbleTop: number | undefined;
  // until the first layout settles (e.g. web fonts swapping in), the bubble
  // snaps to its position instead of gliding into view
  let bubbleSettled = false;

  /**
   * Glide the shared bubble to its new position when the flow below it
   * changes height, starting from wherever it is currently drawn.
   */
  function followFlowHeight() {
    if (!bubbleElement) return;

    const nextTop = bubbleElement.offsetTop;
    const previousTop = bubbleTop;
    bubbleTop = nextTop;

    if (
      !bubbleSettled ||
      previousTop === undefined ||
      previousTop === nextTop ||
      reduceMotion
    )
      return;

    // offset of an in-flight glide, relative to the previous position
    const inFlight = new DOMMatrixReadOnly(
      getComputedStyle(bubbleElement).transform,
    ).m42;

    activeBubbleAnimation?.cancel();
    activeBubbleAnimation = bubbleElement.animate(
      [
        { transform: `translateY(${previousTop + inFlight - nextTop}px)` },
        { transform: "translateY(0)" },
      ],
      {
        duration: 140,
        easing: "cubic-bezier(0.2, 0, 0, 1)",
      },
    );
  }

  onMount(() => {
    followFlowHeight();

    const observer = new ResizeObserver(followFlowHeight);
    observer.observe(flowElement!);
    onCleanup(() => observer.disconnect());

    document.fonts.ready.then(() =>
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          bubbleTop = bubbleElement?.offsetTop;
          bubbleSettled = true;
        }),
      ),
    );
  });

  createEffect(
    on(
      () => location.pathname,
      () => {
        const shouldAnimate = hasMountedAuthFlow;
        hasMountedAuthFlow = true;

        if (shouldAnimate && !reduceMotion) {
          requestAnimationFrame(() => {
            activeFlowAnimation?.cancel();
            activeFlowAnimation = flowElement?.animate(
              [
                {
                  opacity: 0,
                  transform: "translate3d(20px, 6px, 0)",
                },
                {
                  opacity: 1,
                  transform: "translate3d(0, 0, 0)",
                },
              ],
              {
                duration: 280,
                easing: "cubic-bezier(0.05, 0.7, 0.1, 1)",
              },
            );
          });
        }
      },
    ),
  );

  return (
    <div use:scrollable={{ class: root }}>
      <Titlebar />
      <Page>
        <Hero style={{ "--hero": `url("${heroArt}")` }}>
          <Brand aria-hidden="true">
            <Wordmark />
          </Brand>
        </Hero>

        <Content>
          <Topbar>
            <Brand header>
              <Show
                when={
                  (lifecycle.state() === State.Error ||
                    lifecycle.state() === State.Ready) &&
                  state.auth.hasMultiSession()
                }
              >
                <button
                  type="button"
                  class={backButton}
                  onClick={() => {
                    state.auth.popNextPath();
                    openModal({ type: "swap_user" });
                  }}
                >
                  <IconArrowLeft size={16} />
                  <Trans>Back to my accounts</Trans>
                </button>
              </Show>
              <Wordmark />
            </Brand>

            <AccountSwitch>
              <Show
                when={isCreate()}
                fallback={
                  <>
                    <span>
                      <Trans>New to Stoat?</Trans>
                    </span>
                    <A href="/login/create">
                      <Trans>Create account</Trans>
                    </A>
                  </>
                }
              >
                <span>
                  <Trans>Already have an account?</Trans>
                </span>
                <A href="/login/auth">
                  <Trans>Log in</Trans>
                </A>
              </Show>

              <IconButton
                variant="tonal"
                aria-label="Toggle color theme"
                onPress={() =>
                  state.theme.setMode(
                    state.theme.activeTheme.darkMode ? "light" : "dark",
                  )
                }
              >
                <Symbol size={20} fill>
                  dark_mode
                </Symbol>
              </IconButton>
            </AccountSwitch>
          </Topbar>

          <div use:scrollable={{ class: flowWrap }}>
            <FlowStack>
              <FlowBubble
                ref={bubbleElement}
                mood={bubbleMood()}
                errorCount={errorCount()}
                contextMenu={
                  import.meta.env.DEV
                    ? () => (
                        <ContextMenu>
                          <ContextMenuButton
                            icon={<Symbol size={16}>keyboard</Symbol>}
                            onClick={debugType}
                          >
                            Typing
                          </ContextMenuButton>
                          <ContextMenuButton
                            icon={<Symbol size={16}>hourglass_empty</Symbol>}
                            onClick={debugSubmit}
                          >
                            Submitting
                          </ContextMenuButton>
                          <ContextMenuButton
                            icon={<Symbol size={16}>error</Symbol>}
                            onClick={() => bubbleControls.flashError()}
                          >
                            Error
                          </ContextMenuButton>
                          <ContextMenuButton
                            icon={<Symbol size={16}>check_circle</Symbol>}
                            onClick={() => bubbleControls.flashSuccess()}
                          >
                            Success
                          </ContextMenuButton>
                          <ContextMenuDivider />
                          <ContextMenuButton
                            icon={<Symbol size={16}>play_arrow</Symbol>}
                            onClick={debugChaos}
                          >
                            Play all
                          </ContextMenuButton>
                        </ContextMenu>
                      )
                    : undefined
                }
              />
              <div
                ref={flowElement}
                style={{ width: "100%" }}
                onInput={onFlowInput}
              >
                <BubbleProvider value={bubbleControls}>
                  <FlowBase>{props.children}</FlowBase>
                </BubbleProvider>
              </div>
            </FlowStack>
          </div>

          <Footer>
            <span>© CAPS</span>
            <Socials aria-label="Código-fonte">
              <a
                href="https://github.com/VulgoFelp/caps-web"
                target="_blank"
                rel="noreferrer"
                use:floating={{
                  tooltip: {
                    placement: "top",
                    content:
                      "Código-fonte do CAPS (baseado no Stoat, AGPL-3.0)",
                  },
                }}
              >
                <GitHub width={18} height={18} />
              </a>
            </Socials>
          </Footer>
        </Content>
      </Page>
    </div>
  );
}

const backButton = css({
  all: "unset",
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--caps-space-3)",
  flexShrink: 0,
  height: "32px",
  paddingInline: "var(--caps-space-4) var(--caps-space-5)",
  borderRadius: "var(--caps-radius-md)",
  background: "var(--caps-bg-component)",
  color: "var(--caps-text)",
  fontSize: "var(--caps-text-md)",
  fontWeight: 600,
  whiteSpace: "nowrap",
  cursor: "pointer",
  "&:hover": { background: "var(--caps-bg-component-hover)" },
  "&:focus-visible": { boxShadow: "var(--caps-focus-ring)" },
});
