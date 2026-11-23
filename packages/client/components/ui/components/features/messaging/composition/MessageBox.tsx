import { BiRegularBlock } from "solid-icons/bi";
import { Accessor, JSX, Match, Show, Switch, onMount } from "solid-js";

import { Trans } from "@lingui/solid/macro";
import { styled } from "styled-system/jsx";

import { Row } from "@revolt/ui";
import { AutoCompleteSearchSpace } from "@revolt/ui/components/utils/autoComplete";

import { TextEditor2 } from "../../texteditor/TextEditor2";

interface Props {
  /**
   * Initial content
   */
  initialValue: readonly [string];

  /**
   * Node replacement
   */
  nodeReplacement?: readonly [string | "_focus"];

  /**
   * Text content
   */
  content: string;

  /**
   * Handle event to send message
   */
  onSendMessage: () => void;

  /**
   * Handle event when user is typing
   */
  onTyping: () => void;

  /**
   * Handle event when user wants to edit the last message in chat
   */
  onEditLastMessage: () => void;

  /**
   * Update text content
   * @param v New content
   */
  setContent: (v: string) => void;

  /**
   * Actions to the left of the message box
   */
  actionsStart: JSX.Element;

  /**
   * Actions to the right of the message box
   */
  actionsEnd: JSX.Element;

  /**
   * Elements appended after the message box row
   */
  actionsAppend: JSX.Element;

  /**
   * Whether there are elements appended after the message box row
   */
  hasActionsAppend: boolean;

  /**
   * Placeholder in message box
   */
  placeholder: string;

  /**
   * Whether sending messages is allowed
   */
  sendingAllowed: boolean;

  /**
   * Whether the user is currently timed out in this channel/server
   */
  timeoutActive?: boolean;

  /**
   * Auto complete config
   */
  autoCompleteSearchSpace?: Accessor<AutoCompleteSearchSpace>;

  /**
   * Update the current draft selection
   *
   * @deprecated have to hook into ProseMirror instance now!
   */
  updateDraftSelection?: (start: number, end: number) => void;
}

/**
 * Message box container
 */
const Base = styled("div", {
  base: {
    flexGrow: 1,
    minWidth: 0,
    minHeight: "var(--caps-h-md)",

    display: "flex",
    alignItems: "flex-start",
    gap: "var(--caps-space-1)",
    color: "var(--caps-text)",
    fontSize: "var(--caps-text-base)",

    // the editor text sits on the same baseline as the 32px actions
    "& > :not(div:first-child):not(:last-child)": {
      alignSelf: "center",
    },
  },
  variants: {
    hasActionsAppend: {
      true: {},
      false: {},
    },
  },
  defaultVariants: {
    hasActionsAppend: false,
  },
});

/**
 * Composer surface: one raised field holding the editor and all actions
 */
const Parent = styled("div", {
  base: {
    flexShrink: 0,

    display: "flex",
    alignItems: "flex-end",
    gap: "var(--caps-space-2)",
    margin: "0 var(--caps-space-6) var(--caps-space-6)",
    padding: "var(--caps-space-2)",
    maxHeight: "var(--layout-height-message-box)",

    background: "var(--caps-bg-raised)",
    borderRadius: "var(--caps-radius-lg)",
    boxShadow: "inset 0 0 0 1px var(--caps-line)",
    transition: "box-shadow var(--caps-dur) var(--caps-ease)",

    "&:hover": {
      boxShadow: "inset 0 0 0 1px var(--caps-line-strong)",
    },

    "&:focus-within": {
      boxShadow:
        "inset 0 0 0 1px var(--caps-line-strong), 0 0 0 3px rgba(from var(--caps-text) r g b / 0.04)",
    },

    _phone: {
      margin: "0 var(--caps-space-4) var(--caps-space-4)",
    },
  },
});

/**
 * Blocked message
 */
const Blocked = styled(Row, {
  base: {
    flexGrow: 1,
    fontSize: "var(--caps-text-md)",
    color: "var(--caps-text-3)",
    userSelect: "none",
    padding: "var(--caps-space-3) var(--caps-space-4)",
  },
  variants: {
    noPad: { true: { padding: 0 } },
  },
});

/**
 * Specific-width icon container
 */
export const InlineIcon = styled("div", {
  base: {
    flexShrink: 0,
    display: "flex",
    alignItems: "end",
    justifyContent: "center",
  },
  variants: {
    size: {
      short: { width: "8px" },
      normal: { width: "32px" },
    },
  },
  defaultVariants: {
    size: "normal",
  },
});

const FloatingAction = styled("div", {
  base: {
    flexShrink: 0,
    flexGrow: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "end",
  },
  variants: {
    size: {
      short: {
        height: "1em",
      },
      normal: {
        height: "1.5em",
      },
      tall: {
        height: "2em",
      },
    },
    error: {
      true: {
        color: "var(--caps-danger)",
      },
    },
  },
});

const ActionContainer = styled("div", {
  base: {
    flexShrink: 0,
    display: "flex",
    flexGrow: 1,
  },
  variants: {
    column: {
      true: {
        flexFlow: "column",
      },
    },
  },
});

/**
 * Message box
 */
export function MessageBox(props: Props) {
  // props.updateDraftSelection?.(
  //   event.currentTarget.selectionStart,
  //   event.currentTarget.selectionEnd,
  // );

  /**
   * Set initial draft selection
   */
  onMount(() =>
    props.updateDraftSelection?.(props.content.length, props.content.length),
  );

  return (
    <Parent>
      <Base hasActionsAppend={props.hasActionsAppend}>
        <Switch fallback={props.actionsStart}>
          <Match when={props.timeoutActive || !props.sendingAllowed}>
            <InlineIcon>
              <Blocked>
                <BiRegularBlock size={18} />
              </Blocked>
            </InlineIcon>
          </Match>
        </Switch>
        <Switch
          fallback={
            <>
              <TextEditor2
                placeholder={props.placeholder}
                initialValue={props.initialValue}
                nodeReplacement={props.nodeReplacement}
                onChange={props.setContent}
                onComplete={props.onSendMessage}
                onTyping={props.onTyping}
                onPreviousContext={props.onEditLastMessage}
                autoCompleteSearchSpace={props.autoCompleteSearchSpace}
              />
              <Show when={props.sendingAllowed}>{props.actionsEnd}</Show>
            </>
          }
        >
          <Match when={props.timeoutActive}>
            <Blocked align noPad>
              <Trans>
                You are timed out and can't send messages right now.
              </Trans>
            </Blocked>
          </Match>
          <Match when={!props.sendingAllowed}>
            <Blocked align noPad>
              <Trans>
                You don't have permission to send messages in this channel.
              </Trans>
            </Blocked>
          </Match>
        </Switch>
      </Base>
      <Show when={props.sendingAllowed}>{props.actionsAppend}</Show>
    </Parent>
  );
}

MessageBox.InlineIcon = InlineIcon;

MessageBox.FloatingAction = FloatingAction;

MessageBox.ActionContainer = ActionContainer;
