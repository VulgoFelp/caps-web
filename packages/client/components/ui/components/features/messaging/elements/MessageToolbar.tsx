import { Show } from "solid-js";

import { cva } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { MessageContextMenu, useMessage } from "@revolt/app";
import { useUser } from "@revolt/client";
import { useModals } from "@revolt/modal";
import { useState } from "@revolt/state";
import { Ripple } from "@revolt/ui/components/design";
import { iconSize } from "@revolt/ui/components/utils";

import MdMoreVert from "lucide-solid/icons/ellipsis-vertical";
import MdEmojiEmotions from "lucide-solid/icons/face-slightly-smiling";
import MdEdit from "lucide-solid/icons/pencil";
import MdReply from "lucide-solid/icons/reply";
import MdDelete from "lucide-solid/icons/trash";

export function MessageToolbar() {
  const user = useUser();
  const state = useState();
  const { openModal } = useModals();
  const { message, reactPicker } = useMessage();

  let reactRef;

  // todo: a11y for buttons; tabindex

  /**
   * Delete the message
   */
  function deleteMessage(ev: MouseEvent) {
    if (ev.shiftKey) {
      message?.delete();
    } else if (message) {
      openModal({
        type: "delete_message",
        message: message,
      });
    }
  }

  return (
    <Base class="Toolbar">
      <Show when={message?.channel?.havePermission("SendMessage")}>
        <div
          class={tool()}
          onClick={() => state.draft.addReply(message!, user()!.id)}
        >
          <Ripple />
          <MdReply {...iconSize(20)} />
        </div>
      </Show>
      <Show when={message?.channel?.havePermission("React")}>
        <div
          ref={reactRef}
          class={tool()}
          onClick={(e) => reactPicker!()?.onClickEmoji(e, reactRef)}
        >
          <Ripple />
          <MdEmojiEmotions {...iconSize(20)} />
        </div>
      </Show>
      <Show when={message?.author?.self}>
        <div
          class={tool()}
          onClick={() => state.draft.setEditingMessage(message)}
        >
          <Ripple />
          <MdEdit {...iconSize(20)} />
        </div>
      </Show>
      <Show
        when={
          message?.author?.self ||
          message?.channel?.havePermission("ManageMessages")
        }
      >
        <div class={tool()} onClick={deleteMessage}>
          <Ripple />
          <MdDelete {...iconSize(20)} />
        </div>
      </Show>
      <div
        class={tool()}
        use:floating={{
          contextMenu: () => (
            <MessageContextMenu message={message!} reactPicker={reactPicker} />
          ),
          contextMenuHandler: "click",
        }}
      >
        <Ripple />
        <MdMoreVert {...iconSize(20)} />
      </div>
    </Base>
  );
}

const Base = styled("div", {
  base: {
    top: "-16px",
    right: "20px",
    position: "absolute",
    zIndex: 2,

    alignItems: "center",
    gap: "1px",
    padding: "2px",

    display: "none",
    overflow: "hidden",
    borderRadius: "var(--caps-radius-md)",
    boxShadow: "var(--caps-shadow-pop)",

    color: "var(--caps-text-2)",
    fill: "var(--caps-text-2)",
    background: "var(--caps-bg-overlay)",
  },
});

const tool = cva({
  base: {
    cursor: "pointer",
    position: "relative",
    display: "grid",
    placeItems: "center",
    width: "28px",
    height: "28px",
    borderRadius: "var(--caps-radius-sm)",
    transition:
      "background-color var(--caps-dur-fast) var(--caps-ease), color var(--caps-dur-fast) var(--caps-ease)",

    "--md-ripple-hover-opacity": "0",
    "--md-ripple-pressed-opacity": "0.08",

    "& svg": {
      width: "18px",
      height: "18px",
    },

    "&:hover": {
      background: "var(--caps-hover)",
      color: "var(--caps-text)",
      fill: "var(--caps-text)",
    },
  },
});
