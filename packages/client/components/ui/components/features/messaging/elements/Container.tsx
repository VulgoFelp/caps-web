import { JSX, Match, Show, Switch } from "solid-js";

import { useLingui } from "@lingui/solid/macro";
import { cva } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { useMessage } from "@revolt/app";
import { useDevice } from "@revolt/common";
import { Ripple, typography } from "@revolt/ui/components/design";
import { Column, Row } from "@revolt/ui/components/layout";
import {
  NonBreakingText,
  OverflowingText,
  Symbol,
  Time,
} from "@revolt/ui/components/utils";

import { MessageToolbar } from "./MessageToolbar";

interface CommonProps {
  /**
   * Whether this is the tail of another message
   */
  tail?: boolean;

  /**
   * Whether to move the username and related to the left
   *
   * If you want to hide it completely, add a <Match when={true} /> to infoMatch
   */
  compact?: boolean;

  /**
   * Whether this message should be treated as a link
   */
  isLink?: boolean | "hide";
}

type Props = CommonProps & {
  /**
   * Avatar URL
   */
  avatar: JSX.Element;

  /**
   * Pronouns
   */
  pronouns?: string;

  /**
   * Username element
   */
  username: JSX.Element;

  /**
   * Message content
   */
  children: JSX.Element;

  /**
   * Message header
   */
  header?: JSX.Element;

  /**
   * Message info line
   */
  info?: JSX.Element;

  /**
   * Timestamp message was sent at
   */
  timestamp: Date | JSX.Element;

  /**
   * Date message was edited at
   */
  edited?: Date;

  /**
   * Whether this message mentions the user
   */
  mentioned?: boolean;

  /**
   * Whether this message should be highlighted
   */
  highlight?: boolean;

  /**
   * Whether this message is being edited
   */
  editing?: boolean;

  /**
   * Send status of this message
   */
  sendStatus?: "sending" | "failed";

  /**
   * Whether we are hovering this message
   */
  onHover?: (hovering: boolean) => void;

  /**
   * Component to render message context menu
   */
  contextMenu?: () => JSX.Element;

  ref?: HTMLDivElement;

  /**
   * Additional match cases for the inline-start information element
   */
  infoMatch?: JSX.Element;

  /**
   * Reference time to render timestamps from
   */
  _referenceTime?: number;
};

/**
 * Message container layout
 */
const base = cva({
  base: {
    position: "relative",

    display: "flex",
    flexDirection: "column",

    padding: "2px 0",
    background: "transparent",
    minHeight: "1em",

    transition: "background-color var(--caps-dur-fast) var(--caps-ease)",

    "& a:hover": {
      textDecoration: "underline",
    },

    "&:hover .Toolbar": {
      display: "flex",
    },
  },
  variants: {
    tail: {
      true: {
        marginTop: 0,
      },
    },
    mentioned: {
      true: {
        background: "var(--caps-mention-soft)",
        boxShadow: "inset 2px 0 0 var(--caps-mention)",
      },
    },
    highlight: {
      true: {
        animation: "highlightMessage 3s",
      },
    },
    sendStatus: {
      failed: {
        color: "var(--caps-danger)",
      },
      sending: {
        color: "var(--caps-text-3)",
      },
      sent: {
        color: "var(--caps-text)",
      },
    },
    isLink: {
      true: {
        cursor: "pointer",
        userSelect: "none",
        position: "relative",
        borderRadius: "var(--caps-radius-md)",

        "& *": {
          pointerEvents: "none",
        },
      },
      false: {
        marginTop: "var(--message-group-spacing) !important",

        // flush hover band across the whole timeline
        "&:hover": {
          background: "var(--caps-hover)",
        },
      },
      hide: {},
    },
    iOSTouch: {
      true: {
        "-webkit-touch-callout": "none",
        "-webkit-user-select": "none",
        "user-select": "none",
      },
    },
  },
  compoundVariants: [
    {
      mentioned: true,
      isLink: false,
      css: {
        "&:hover": {
          background: "var(--caps-mention-soft)",
        },
      },
    },
  ],
  defaultVariants: {
    isLink: false,
    sendStatus: "sent",
  },
});

/**
 * Left-side information or avatar
 */
const Info = styled("div", {
  base: {
    display: "flex",
    flexShrink: 0,
    justifyContent: "end",
    padding: "2px 14px 0 16px",
  },
  variants: {
    tail: {
      true: {
        paddingTop: 0,
      },
    },
    compact: {
      true: {},
      false: {
        width: "66px",
      },
    },
  },
  defaultVariants: {
    compact: false,
  },
});

/**
 * Right-side message content
 */
const Body = styled("div", {
  base: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    gap: "1px",

    minWidth: 0,
    overflow: "hidden",
    paddingInlineEnd: "var(--caps-space-8)",
  },
  variants: {
    editing: {
      true: {
        flexGrow: 1,
        overflow: "visible",
      },
    },
  },
});

const Content = styled("div", {
  base: {
    minWidth: 0,
    display: "flex",
    gap: "var(--caps-space-2)",
    flexDirection: "column",
    lineHeight: 1.45,
    color: "var(--caps-text)",

    ...typography.raw({ class: "_messages" }),
  },
});

/**
 * Information text
 */
const infoText = cva({
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-2)",

    color: "var(--caps-text-3)",
    fontSize: "var(--caps-text-xs)",
    fontWeight: 400,
    letterSpacing: "0.01em",
    fontVariantNumeric: "tabular-nums",
  },
  variants: {
    prefix: {
      true: {
        width: "100%",
        fontSize: "10px",

        overflow: "hidden",
        overflowWrap: "none",
        whiteSpace: "nowrap",

        display: "block",
        textAlign: "right",
        lineHeight: "calc(var(--message-size) * 1.45)",
      },
    },
    hidden: {
      true: {
        opacity: 0,
        transition: "opacity var(--caps-dur-fast) var(--caps-ease)",

        _groupHover: {
          opacity: 1,
        },
      },
    },
    shrink: {
      true: {
        flexGrow: 1,
        flexBasis: 0,
        maxWidth: "fit-content",
      },
    },
  },
});

/**
 * Additional styles for compact mode
 */
const CompactInfo = styled(Row, {
  base: {
    flexShrink: 0,
    marginTop: "-2px",
    height: "fit-content",
    paddingInline: "var(--caps-space-6) 0",
  },
});

/**
 * Component to show avatar, username, timestamp and content
 */
export function MessageContainer(props: Props) {
  const { t } = useLingui();
  const { message } = useMessage();
  const { isMobile, isIOSTouch } = useDevice();

  return (
    <div
      id={message?.id}
      ref={props.ref}
      onMouseEnter={() => props.onHover && props.onHover(true)}
      onMouseLeave={() => props.onHover && props.onHover(false)}
      class={
        "group " +
        base({
          tail: props.tail,
          mentioned: props.mentioned,
          highlight: props.highlight,
          sendStatus: props.sendStatus,
          isLink: props.isLink,
          iOSTouch: isIOSTouch,
        })
      }
      use:floating={{ contextMenu: props.contextMenu }}
    >
      <Show
        when={
          !isMobile &&
          message &&
          props.isLink !== true &&
          props.isLink !== "hide"
        }
      >
        <MessageToolbar />
      </Show>

      <Show when={props.isLink}>
        <Ripple />
      </Show>

      {props.header}
      <Row>
        <Info tail={props.tail} compact={props.compact}>
          <Switch fallback={props.avatar}>
            {props.infoMatch ?? <Match when={false} children={null} />}
            <Match when={props.compact}>
              <CompactInfo gap="sm" align>
                <div
                  class={infoText()}
                  use:floating={{
                    tooltip: {
                      placement: "top",
                      content: () => (
                        <Column>
                          <span>
                            {t`Sent`}{" "}
                            <Time
                              format="datetime"
                              value={props.timestamp}
                              referenceTime={props._referenceTime}
                            />
                          </span>
                          <Show when={props.edited}>
                            <span>
                              {t`Edited`}{" "}
                              <Time
                                format="datetime"
                                value={props.edited}
                                referenceTime={props._referenceTime}
                              />
                            </span>
                          </Show>
                        </Column>
                      ),
                      aria: "",
                    },
                  }}
                >
                  <Time
                    format="time"
                    value={props.timestamp}
                    referenceTime={props._referenceTime}
                  />
                </div>
                {props.username}
                {props.info}
                <Show when={props.edited}>
                  <Symbol size={16}>edit</Symbol>
                </Show>
              </CompactInfo>
            </Match>
            <Match when={props.tail}>
              <div
                class={infoText({ hidden: !props.edited, prefix: true })}
                use:floating={{
                  tooltip: {
                    placement: "top",
                    content: () => (
                      <Column>
                        <span>
                          {t`Sent`}{" "}
                          <Time
                            format="datetime"
                            value={props.timestamp}
                            referenceTime={props._referenceTime}
                          />
                        </span>
                        <Show when={props.edited}>
                          <span>
                            {t`Edited`}{" "}
                            <Time
                              format="datetime"
                              value={props.edited}
                              referenceTime={props._referenceTime}
                            />
                          </span>
                        </Show>
                      </Column>
                    ),
                    aria: "",
                  },
                }}
              >
                <Show
                  when={props.edited}
                  fallback={
                    <Time
                      value={props.timestamp}
                      format="time"
                      referenceTime={props._referenceTime}
                    />
                  }
                >
                  (edited)
                </Show>
              </div>
            </Match>
          </Switch>
        </Info>
        <Body editing={props.editing}>
          <Show when={!props.tail && !props.compact}>
            <Row gap="sm" align style={{ "line-height": "1.3" }}>
              <OverflowingText>{props.username}</OverflowingText>
              <NonBreakingText class={infoText()}>{props.info}</NonBreakingText>
              <Show when={props.pronouns}>
                <OverflowingText class={infoText({ shrink: true })}>
                  <span>{props.pronouns}</span>
                  <span>·</span>
                </OverflowingText>
              </Show>
              <NonBreakingText class={infoText()}>
                <Show
                  when={props.timestamp instanceof Date}
                  fallback={props.timestamp as JSX.Element}
                >
                  <span
                    use:floating={{
                      tooltip: {
                        placement: "top",
                        content: () => (
                          <>
                            {t`Sent`}{" "}
                            <Time
                              format="datetime"
                              value={props.timestamp}
                              referenceTime={props._referenceTime}
                            />
                          </>
                        ),
                        aria: "",
                      },
                    }}
                  >
                    <Time
                      format="calendar"
                      value={props.timestamp}
                      referenceTime={props._referenceTime}
                    />
                  </span>
                </Show>
                <Show when={props.edited}>
                  <span
                    use:floating={{
                      tooltip: {
                        placement: "top",
                        content: () => (
                          <>
                            {t`Edited`}{" "}
                            <Time
                              format="datetime"
                              value={props.edited}
                              referenceTime={props._referenceTime}
                            />
                          </>
                        ),
                        aria: "",
                      },
                    }}
                  >
                    (edited)
                  </span>
                </Show>
              </NonBreakingText>
            </Row>
          </Show>
          <Content>{props.children}</Content>
        </Body>
      </Row>
    </div>
  );
}
