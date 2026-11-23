import { Show } from "solid-js";

import { styled } from "styled-system/jsx";

/**
 * CAPS platform staff badges
 *
 * Stored in the user's `badges` bitfield on bits the upstream project does
 * not use. Granted with `staff.sh` on the server (staff accounts are also
 * marked as privileged in the backend).
 */
export const CAPS_BADGE_ADMIN = 1 << 11; // 2048
export const CAPS_BADGE_MOD = 1 << 12; // 4096

export type StaffRole = "admin" | "mod";

/**
 * Resolve the staff role from a badges bitfield (admin wins over mod)
 * @param badges User badges
 */
export function staffRole(badges?: number): StaffRole | undefined {
  if (!badges) return undefined;
  if (badges & CAPS_BADGE_ADMIN) return "admin";
  if (badges & CAPS_BADGE_MOD) return "mod";
  return undefined;
}

const LABEL: Record<StaffRole, string> = {
  admin: "Administrador",
  mod: "Moderador",
};

const TOOLTIP: Record<StaffRole, string> = {
  admin: "Administrador do CAPS",
  mod: "Moderador do CAPS",
};

/**
 * Shield glyph; filled for admins, outlined for moderators
 */
function Shield(props: { role: StaffRole; size: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={props.size}
      height={props.size}
      aria-hidden="true"
    >
      <path
        d="M12 2.5 4.5 5.3v6.1c0 4.6 3.1 8.6 7.5 10.1 4.4-1.5 7.5-5.5 7.5-10.1V5.3L12 2.5Z"
        fill={props.role === "admin" ? "var(--caps-accent)" : "none"}
        stroke="var(--caps-accent)"
        stroke-width={props.role === "admin" ? 0 : 2}
        stroke-linejoin="round"
      />
      {props.role === "admin" ? (
        // star
        <path
          d="m12 7.6 1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4L12 7.6Z"
          fill="var(--caps-on-accent)"
        />
      ) : (
        // check
        <path
          d="m8.6 12.2 2.4 2.4 4.4-4.6"
          fill="none"
          stroke="var(--caps-accent)"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      )}
    </svg>
  );
}

/**
 * Platform staff badge
 *
 * - `sm`: icon shown next to a username (messages, member list)
 * - `lg`: pill with label shown on the profile card
 *
 * Renders nothing when the user is not staff.
 */
export function StaffBadge(props: { badges?: number; size?: "sm" | "lg" }) {
  const role = () => staffRole(props.badges);

  return (
    <Show when={role()}>
      {(r) => (
        <Show
          when={props.size === "lg"}
          fallback={
            <Inline
              role="img"
              aria-label={TOOLTIP[r()]}
              use:floating={{
                tooltip: { placement: "top", content: TOOLTIP[r()] },
              }}
            >
              <Shield role={r()} size={14} />
            </Inline>
          }
        >
          <Pill
            role={r()}
            use:floating={{
              tooltip: { placement: "top", content: TOOLTIP[r()] },
            }}
          >
            <Shield role={r()} size={16} />
            {LABEL[r()]}
          </Pill>
        </Show>
      )}
    </Show>
  );
}

const Inline = styled("span", {
  base: {
    display: "inline-grid",
    placeItems: "center",
    flexShrink: 0,
    width: "16px",
    height: "16px",
    verticalAlign: "middle",
    cursor: "default",
  },
});

const Pill = styled("span", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--caps-space-3)",
    height: "26px",
    padding: "0 10px 0 7px",
    borderRadius: "var(--caps-radius-sm)",
    fontSize: "var(--caps-text-sm)",
    fontWeight: 600,
    letterSpacing: "0.01em",
    color: "var(--caps-text)",
    cursor: "default",
  },
  variants: {
    role: {
      admin: {
        background: "var(--caps-accent-soft)",
        boxShadow: "inset 0 0 0 1px rgba(from var(--caps-accent) r g b / 0.45)",
      },
      mod: {
        background: "var(--caps-bg-raised)",
        boxShadow: "inset 0 0 0 1px var(--caps-line)",
      },
    },
  },
});
