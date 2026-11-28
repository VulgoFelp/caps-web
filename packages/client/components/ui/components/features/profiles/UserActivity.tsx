import { Show, createRoot, createSignal } from "solid-js";

import { Trans } from "@lingui/solid/macro";
import type { User } from "stoat.js";
import { css, cx } from "styled-system/css";

import IconGamepad from "lucide-solid/icons/gamepad-2";

/**
 * CAPS: shared minute ticker so every "playing for X" label updates together
 * without one interval per row
 */
const now = createRoot(() => {
  const [now, setNow] = createSignal(Date.now());
  setInterval(() => setNow(Date.now()), 30_000);
  return now;
});

/**
 * Format how long an activity has been going on (language-neutral)
 * @param startedAt Start of the activity
 * @returns e.g. "<1 min", "23 min", "1 h 05 min"
 */
export function formatActivityElapsed(startedAt: Date) {
  const minutes = Math.max(
    0,
    Math.floor((now() - startedAt.getTime()) / 60_000),
  );

  if (minutes < 1) return "<1 min";
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest
    ? `${hours} h ${String(rest).padStart(2, "0")} min`
    : `${hours} h`;
}

/**
 * "Playing <game> · 23 min" line for a user, renders nothing without activity
 */
export function UserActivityLine(props: {
  user: User;
  /**
   * Show elapsed time
   */
  elapsed?: boolean;
  /**
   * Emphasised variant (profile card)
   */
  emphasis?: boolean;
  class?: string;
}) {
  return (
    <Show when={props.user.activity}>
      {(activity) => (
        <span
          class={cx(line, props.emphasis && lineEmphasis, props.class)}
          title={activity().name}
        >
          <IconGamepad size={props.emphasis ? 15 : 13} class={icon} />
          <span class={label}>
            <Trans>
              Playing <b class={game}>{activity().name}</b>
            </Trans>
          </span>
          <Show when={props.elapsed !== false}>
            <span class={time} aria-hidden="true">
              · {formatActivityElapsed(activity().startedAt)}
            </span>
          </Show>
        </span>
      )}
    </Show>
  );
}

const line = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--caps-space-2)",
  minWidth: 0,
  maxWidth: "100%",
  fontSize: "var(--caps-text-sm)",
  color: "var(--caps-text-2)",
});

const lineEmphasis = css({
  padding: "var(--caps-space-3) var(--caps-space-4)",
  borderRadius: "var(--caps-radius-md)",
  background: "var(--caps-accent-soft)",
  border: "1px solid var(--caps-accent-line)",
  color: "var(--caps-text)",
  fontSize: "var(--caps-text-md)",
});

const icon = css({
  flexShrink: 0,
  color: "var(--caps-accent-text)",
});

const label = css({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  minWidth: 0,
});

const game = css({
  fontWeight: 600,
  color: "var(--caps-text)",
});

const time = css({
  flexShrink: 0,
  fontVariantNumeric: "tabular-nums",
  color: "var(--caps-text-3)",
});
