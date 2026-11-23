import type { JSX } from "solid-js";
import { For, Show, splitProps } from "solid-js";
import { Portal } from "solid-js/web";
import { Motion, Presence } from "solid-motionone";

import { styled } from "styled-system/jsx";

import { Button } from "./Button";
import { typography } from "./Text";

export interface DialogProps {
  show: boolean;
  onClose: () => void;
}

export interface DialogAction {
  text: JSX.Element;
  onClick?: () => void | Promise<unknown> | true | false;
  isDisabled?: boolean;
}

type Props = DialogProps & {
  icon?: JSX.Element;
  title?: JSX.Element;
  children: JSX.Element;
  actions?: DialogAction[];
  isDisabled?: boolean;

  scrimBackground?: string;

  minWidth?: number;
  padding?: number;
};

/**
 * Dialogs provide important prompts in a user flow
 *
 * @specification https://m3.material.io/components/dialogs
 */
export function Dialog(props: Props) {
  return (
    <Portal mount={document.getElementById("floating")!}>
      <Dialog.Scrim
        show={props.show}
        onClick={props.onClose}
        style={{
          "--scrim": "var(--caps-scrim)",
          "--background": props.scrimBackground
            ? `url('${props.scrimBackground}'), var(--scrim)`
            : "var(--scrim)",
        }}
      >
        <Presence>
          <Show when={props.show}>
            <Motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.18, easing: [0.16, 1, 0.3, 1] }}
              class="dialog"
            >
              <Container
                style={{
                  "min-width": props.minWidth
                    ? `${props.minWidth}px`
                    : undefined,
                  padding: props.padding ? `${props.padding}px` : undefined,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Show when={props.icon}>
                  <Icon>{props.icon}</Icon>
                </Show>
                <Show when={props.title}>
                  <Title withIcon={typeof props.icon !== "undefined"}>
                    {props.title}
                  </Title>
                </Show>
                <Content class={typography()}>{props.children}</Content>
                <Show when={props.actions}>
                  <Actions>
                    <For each={props.actions}>
                      {(action, index) => (
                        <Button
                          // the last action is the primary one
                          variant={
                            index() === props.actions!.length - 1
                              ? "filled"
                              : "tonal"
                          }
                          size="sm"
                          onPress={() => {
                            if (action.isDisabled) return;

                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const value = action.onClick?.() as any;
                            if (value instanceof Promise) {
                              value.then(props.onClose).catch(() => {});
                            } else if (value !== false) {
                              props.onClose();
                            }
                          }}
                          isDisabled={action.isDisabled || props.isDisabled}
                        >
                          {action.text}
                        </Button>
                      )}
                    </For>
                  </Actions>
                </Show>
              </Container>
            </Motion.div>
          </Show>
        </Presence>
      </Dialog.Scrim>
    </Portal>
  );
}

/**
 * Full-screen scrim shown below dialogs
 *
 * @specification https://m3.material.io/components/dialogs
 */
Dialog.Scrim = (
  props: Omit<
    Parameters<typeof Scrim>[0] & Parameters<typeof ScrimSurface>[0],
    "class"
  >,
) => {
  const [local, remote] = splitProps(props, [
    "children",
    "padding",
    "overflow",
  ]);

  return (
    <Scrim {...remote} class="dialog_scrim">
      <ScrimSurface {...local} />
    </Scrim>
  );
};

const Scrim = styled("div", {
  base: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    position: "fixed",
    zIndex: "998",
    maxHeight: "100%",
    paddingTop: "var(--inset-top)",
    paddingInline: "var(--inset-left) var(--inset-right)",
    paddingBottom: "max(var(--inset-bottom), env(keyboard-inset-height, 0px))",

    animationName: "scrimFadeIn",
    animationDuration: "0.15s",
    animationFillMode: "forwards",
    transition: "var(--transitions-medium) all",
  },
  variants: {
    show: {
      false: {
        animationName: "unset",
        pointerEvents: "none",
        background: "transparent",
      },
    },
    dark: {
      true: {
        "--background": "rgba(6, 6, 5, 0.92)",
      },
      false: {
        "--background": "var(--caps-scrim)",
      },
    },
  },
  defaultVariants: {
    show: true,
    dark: false,
  },
});

const ScrimSurface = styled("div", {
  base: {
    width: "100%",
    height: "100%",
    display: "grid",
    userSelect: "none",
    placeItems: "center",
    pointerEvents: "all",
  },
  variants: {
    padding: {
      true: {
        padding: "64px",
        _phone: { padding: "16px" },
      },
    },
    overflow: {
      true: {
        overflowY: "auto",
      },
    },
  },
  defaultVariants: {
    padding: true,
    overflow: true,
  },
});

const Container = styled("div", {
  base: {
    padding: "var(--caps-space-7)",
    minWidth: "320px",
    maxWidth: "480px",
    borderRadius: "var(--caps-radius-server)",

    display: "flex",
    flexDirection: "column",

    color: "var(--caps-text)",
    background: "var(--caps-bg-overlay)",
    boxShadow: "var(--caps-shadow-modal)",

    _phone: {
      minWidth: "unset",
      width: "100%",
    },
  },
});

const Icon = styled("div", {
  base: {
    alignSelf: "flex-start",
    display: "grid",
    placeItems: "center",
    width: "40px",
    height: "40px",
    marginBottom: "var(--caps-space-5)",
    borderRadius: "var(--caps-radius-lg)",
    color: "var(--caps-accent)",
    fill: "var(--caps-accent)",
    background: "var(--caps-accent-soft)",
  },
});

const Title = styled("span", {
  base: {
    fontSize: "var(--caps-text-xl)",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    lineHeight: 1.3,
    marginBlockEnd: "var(--caps-space-3)",
  },
  variants: {
    withIcon: {
      true: {},
    },
  },
  defaultVariants: {
    withIcon: false,
  },
});

const Content = styled("div", {
  base: {
    color: "var(--caps-text-2)",
    fontSize: "var(--caps-text-base)",
    lineHeight: 1.5,
  },
});

const Actions = styled("div", {
  base: {
    gap: "var(--caps-space-4)",
    display: "flex",
    justifyContent: "end",
    marginBlockStart: "var(--caps-space-7)",
  },
});
