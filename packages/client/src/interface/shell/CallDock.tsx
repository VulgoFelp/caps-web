import { For, Show, createEffect, createSignal, on, onCleanup } from "solid-js";

import { useLingui } from "@lingui/solid/macro";
import { RoomEvent } from "livekit-client";
import { css, cva } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { useClient } from "@revolt/client";
import { useInstance } from "@revolt/instance";
import { useNavigate } from "@revolt/routing";
import { useVoice } from "@revolt/rtc";
import { useState } from "@revolt/state";
import { Avatar } from "@revolt/ui";

import IconHeadphoneOff from "lucide-solid/icons/headphone-off";
import IconHeadphones from "lucide-solid/icons/headphones";
import IconMic from "lucide-solid/icons/mic";
import IconMicOff from "lucide-solid/icons/mic-off";
import IconPhoneOff from "lucide-solid/icons/phone-off";
import IconScreenShare from "lucide-solid/icons/screen-share";
import IconScreenShareOff from "lucide-solid/icons/screen-share-off";
import IconVideo from "lucide-solid/icons/video";
import IconVideoOff from "lucide-solid/icons/video-off";

import { MOD_KEY } from "./shellState";

/**
 * Persistent call mini-player docked at the bottom of the sidebar
 *
 * Stays visible while you browse the rest of the app during a call:
 * where you are, how long, who is talking, and every audio/video control.
 */
export function CallDock() {
  const { t } = useLingui();
  const voice = useVoice();
  const client = useClient();
  const state = useState();
  const navigate = useNavigate();
  const { limits } = useInstance();

  // call timer
  const [startedAt, setStartedAt] = createSignal<number>();
  const [now, setNow] = createSignal(Date.now());
  createEffect(
    on(
      () => voice.state(),
      (s) => {
        if (s === "CONNECTED" && !startedAt()) setStartedAt(Date.now());
        if (s === "READY" || s === "DISCONNECTED") setStartedAt(undefined);
      },
    ),
  );
  const tick = setInterval(() => setNow(Date.now()), 1000);
  onCleanup(() => clearInterval(tick));

  const elapsed = () => {
    const start = startedAt();
    if (!start) return "";
    const s = Math.max(0, Math.floor((now() - start) / 1000));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = String(s % 60).padStart(2, "0");
    return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
  };

  // who is speaking (LiveKit active speakers)
  const [speaking, setSpeaking] = createSignal<Set<string>>(new Set());
  createEffect(
    on(
      () => voice.room(),
      (room) => {
        if (!room) return setSpeaking(new Set<string>());
        const update = () =>
          setSpeaking(new Set(room.activeSpeakers.map((p) => p.identity)));
        room.on(RoomEvent.ActiveSpeakersChanged, update);
        onCleanup(() => room.off(RoomEvent.ActiveSpeakersChanged, update));
      },
    ),
  );

  const channel = () => voice.channel();
  const participants = () =>
    channel() ? [...channel()!.voiceParticipants.values()] : [];

  const where = () => {
    const c = channel();
    if (!c) return "";
    return (
      c.server?.name ?? (c.type === "Group" ? t`Group` : t`Direct message`)
    );
  };

  const status = () => {
    switch (voice.state()) {
      case "CONNECTING":
        return t`Connecting…`;
      case "RECONNECTING":
        return t`Reconnecting…`;
      case "DISCONNECTED":
        return t`Disconnected`;
      default:
        return elapsed();
    }
  };

  function goToRoom() {
    const c = channel();
    if (!c) return;
    navigate(c.path);
    state.appDrawer()?.setShown(true);
  }

  return (
    <Show when={channel()}>
      <Dock aria-label={t`Current call`}>
        <Top>
          <span
            class={signal()}
            data-state={voice.state()}
            aria-hidden="true"
          />
          <button
            type="button"
            class={roomButton}
            onClick={goToRoom}
            use:floating={{
              tooltip: {
                placement: "top",
                content: t`Return to voice channel`,
              },
            }}
          >
            <span class={`${roomName} caps-room-name`}>
              {channel()!.displayName ?? channel()!.name}
            </span>
            <span class={roomMeta}>
              {where()}
              <Show when={status()}>
                <span class={timer}> · {status()}</span>
              </Show>
            </span>
          </button>
        </Top>

        <Show when={participants().length}>
          <People>
            <For each={participants().slice(0, 7)}>
              {(p) => {
                const user = () => client().users.get(p.userId);
                return (
                  <span
                    class={person}
                    data-speaking={speaking().has(p.userId) || undefined}
                    data-muted={!p.isPublishing() || undefined}
                    title={user()?.displayName}
                  >
                    <Avatar
                      size={22}
                      src={user()?.avatarURL}
                      fallback={user()?.displayName}
                    />
                  </span>
                );
              }}
            </For>
            <Show when={participants().length > 7}>
              <span class={moreCount}>+{participants().length - 7}</span>
            </Show>
          </People>
        </Show>

        <Controls>
          <button
            type="button"
            class={control({ off: !voice.microphone() })}
            aria-pressed={!voice.microphone()}
            aria-label={voice.microphone() ? t`Mute` : t`Unmute`}
            disabled={!voice.speakingPermission}
            onClick={() => voice.toggleMute()}
            use:floating={{
              tooltip: {
                placement: "top",
                content: `${voice.microphone() ? t`Mute` : t`Unmute`} · ${MOD_KEY}+⇧+M`,
              },
            }}
          >
            <Show when={voice.microphone()} fallback={<IconMicOff size={17} />}>
              <IconMic size={17} />
            </Show>
          </button>
          <button
            type="button"
            class={control({ off: voice.deafen() || !voice.listenPermission })}
            aria-pressed={voice.deafen()}
            aria-label={voice.deafen() ? t`Undeafen` : t`Deafen`}
            disabled={!voice.listenPermission}
            onClick={() => voice.toggleDeafen()}
            use:floating={{
              tooltip: {
                placement: "top",
                content: `${voice.deafen() ? t`Undeafen` : t`Deafen`} · ${MOD_KEY}+⇧+D`,
              },
            }}
          >
            <Show
              when={voice.deafen() || !voice.listenPermission}
              fallback={<IconHeadphones size={17} />}
            >
              <IconHeadphoneOff size={17} />
            </Show>
          </button>
          <Show when={limits().video}>
            <button
              type="button"
              class={control({ on: voice.video() })}
              aria-pressed={voice.video()}
              aria-label={voice.video() ? t`Stop camera` : t`Start camera`}
              onClick={() => voice.toggleCamera()}
              use:floating={{
                tooltip: {
                  placement: "top",
                  content: voice.video() ? t`Stop camera` : t`Start camera`,
                },
              }}
            >
              <Show when={voice.video()} fallback={<IconVideoOff size={17} />}>
                <IconVideo size={17} />
              </Show>
            </button>
            <button
              type="button"
              class={control({ on: voice.screenshare() })}
              aria-pressed={voice.screenshare()}
              aria-label={
                voice.screenshare() ? t`Stop sharing` : t`Share screen`
              }
              onClick={() => voice.toggleScreenshare()}
              use:floating={{
                tooltip: {
                  placement: "top",
                  content: voice.screenshare()
                    ? t`Stop sharing`
                    : t`Share screen`,
                },
              }}
            >
              <Show
                when={voice.screenshare()}
                fallback={<IconScreenShare size={17} />}
              >
                <IconScreenShareOff size={17} />
              </Show>
            </button>
          </Show>
          <span class={css({ flex: 1 })} />
          <button
            type="button"
            class={control({ danger: true })}
            aria-label={t`Leave call`}
            onClick={() => voice.disconnect()}
            use:floating={{
              tooltip: { placement: "top", content: t`Leave call` },
            }}
          >
            <IconPhoneOff size={17} />
          </button>
        </Controls>
      </Dock>
    </Show>
  );
}

const Dock = styled("section", {
  base: {
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: "var(--caps-space-4)",
    margin: "var(--caps-space-4)",
    padding: "var(--caps-space-5)",
    borderRadius: "var(--caps-radius-lg)",
    background: "var(--caps-bg-surface)",
    boxShadow: "inset 0 0 0 1px var(--caps-line-soft)",
    animation: "capsPopIn 180ms var(--caps-ease-out)",
  },
});

const Top = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-4)",
    minWidth: 0,
  },
});

const signal = cva({
  base: {
    width: "8px",
    height: "8px",
    flexShrink: 0,
    borderRadius: "var(--caps-radius-full)",
    background: "var(--caps-success)",
    boxShadow: "0 0 0 3px var(--caps-success-soft)",
    '&[data-state="CONNECTING"], &[data-state="RECONNECTING"]': {
      background: "var(--caps-warning)",
      boxShadow: "0 0 0 3px var(--caps-mention-soft)",
    },
    '&[data-state="DISCONNECTED"]': {
      background: "var(--caps-danger)",
      boxShadow: "0 0 0 3px var(--caps-danger-soft)",
    },
  },
});

const roomButton = css({
  all: "unset",
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  cursor: "pointer",
  "&:hover .caps-room-name": { textDecoration: "underline" },
  "&:focus-visible": {
    boxShadow: "var(--caps-focus-ring)",
    borderRadius: "4px",
  },
});

const roomName = css({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: "var(--caps-text-md)",
  fontWeight: 600,
  color: "var(--caps-success)",
});

const roomMeta = css({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: "var(--caps-text-sm)",
  color: "var(--caps-text-3)",
});

const timer = css({ fontVariantNumeric: "tabular-nums" });

const People = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-2)",
  },
});

const person = css({
  display: "grid",
  borderRadius: "var(--caps-radius-full)",
  boxShadow: "0 0 0 2px transparent",
  transition: "box-shadow var(--caps-dur-fast) var(--caps-ease)",
  "&[data-speaking]": { boxShadow: "0 0 0 2px var(--caps-success)" },
  "&[data-muted]": { opacity: 0.65 },
});

const moreCount = css({
  fontSize: "11px",
  fontWeight: 600,
  color: "var(--caps-text-3)",
  paddingInlineStart: "var(--caps-space-2)",
});

const Controls = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-2)",
  },
});

const control = cva({
  base: {
    all: "unset",
    display: "grid",
    placeItems: "center",
    width: "34px",
    height: "32px",
    borderRadius: "var(--caps-radius-md)",
    background: "var(--caps-bg-component)",
    color: "var(--caps-text)",
    cursor: "pointer",
    transition:
      "background var(--caps-dur-fast) var(--caps-ease), color var(--caps-dur-fast) var(--caps-ease)",
    "&:hover": { background: "var(--caps-bg-component-hover)" },
    "&:active": { transform: "scale(0.96)" },
    "&:focus-visible": { boxShadow: "var(--caps-focus-ring)" },
    "&:disabled": { opacity: 0.4, cursor: "not-allowed" },
  },
  variants: {
    off: {
      true: {
        background: "var(--caps-danger-soft)",
        color: "var(--caps-danger)",
        "&:hover": { background: "var(--caps-danger-soft)" },
      },
    },
    on: {
      true: {
        background: "var(--caps-accent)",
        color: "var(--caps-on-accent)",
        "&:hover": { background: "var(--caps-accent-hover)" },
      },
    },
    danger: {
      true: {
        background: "var(--caps-danger)",
        color: "#fff",
        "&:hover": {
          background: "var(--caps-danger)",
          filter: "brightness(1.08)",
        },
      },
    },
  },
});
