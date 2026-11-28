import { JSX, Show, createSignal } from "solid-js";
import { Portal } from "solid-js/web";

import { css, cva } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { Avatar } from "@revolt/ui";

import { StaffUser, tagOf, useStaffApi } from "./api";

export const Toolbar = styled("div", {
  base: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "var(--caps-space-4)",
  },
});

export const SearchInput = styled("input", {
  base: {
    flex: "1 1 240px",
    maxWidth: "360px",
    height: "34px",
    paddingInline: "var(--caps-space-5)",
    border: "none",
    outline: "none",
    borderRadius: "var(--caps-radius-md)",
    background: "var(--caps-bg-surface)",
    boxShadow: "inset 0 0 0 1px var(--caps-line-soft)",
    color: "var(--caps-text)",
    fontFamily: "inherit",
    fontSize: "var(--caps-text-md)",
    "&::placeholder": { color: "var(--caps-text-3)" },
    "&:focus": {
      boxShadow:
        "inset 0 0 0 1px var(--caps-accent-line), 0 0 0 3px var(--caps-accent-soft)",
    },
  },
});

/**
 * Segmented filter
 */
export function Segmented<T extends string>(props: {
  value: T;
  options: { value: T; label: JSX.Element; count?: number }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div class={segmented} role="tablist" aria-label={props.label}>
      {props.options.map((o) => (
        <button
          type="button"
          role="tab"
          aria-selected={props.value === o.value}
          class={segment}
          onClick={() => props.onChange(o.value)}
        >
          {o.label}
          <Show when={o.count}>
            <span class={segmentCount}>{o.count}</span>
          </Show>
        </button>
      ))}
    </div>
  );
}

const segmented = css({
  display: "inline-flex",
  alignSelf: "flex-start",
  maxWidth: "100%",
  overflowX: "auto",
  gap: "2px",
  padding: "3px",
  borderRadius: "var(--caps-radius-md)",
  background: "var(--caps-bg-surface)",
  boxShadow: "inset 0 0 0 1px var(--caps-line-soft)",
});

const segment = css({
  all: "unset",
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--caps-space-3)",
  height: "28px",
  paddingInline: "var(--caps-space-5)",
  borderRadius: "var(--caps-radius-sm)",
  fontSize: "var(--caps-text-md)",
  fontWeight: 500,
  color: "var(--caps-text-2)",
  cursor: "pointer",
  "&:hover": { color: "var(--caps-text)" },
  "&[aria-selected=true]": {
    background: "var(--caps-bg-component)",
    color: "var(--caps-text)",
  },
  "&:focus-visible": { boxShadow: "var(--caps-focus-ring)" },
});

const segmentCount = css({
  minWidth: "18px",
  height: "18px",
  paddingInline: "5px",
  borderRadius: "var(--caps-radius-full)",
  background: "var(--caps-mention)",
  color: "#1d1404",
  fontSize: "11px",
  fontWeight: 700,
  lineHeight: "18px",
  textAlign: "center",
});

export const pill = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    height: "20px",
    paddingInline: "7px",
    borderRadius: "var(--caps-radius-xs)",
    fontSize: "11px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  variants: {
    tone: {
      accent: {
        background: "var(--caps-accent-soft)",
        color: "var(--caps-accent-text)",
      },
      danger: {
        background: "var(--caps-danger-soft)",
        color: "var(--caps-danger)",
      },
      warning: {
        background: "var(--caps-mention-soft)",
        color: "var(--caps-mention)",
      },
      success: {
        background: "var(--caps-success-soft)",
        color: "var(--caps-success)",
      },
      neutral: {
        background: "var(--caps-bg-component)",
        color: "var(--caps-text-2)",
      },
    },
  },
  defaultVariants: { tone: "neutral" },
});

/**
 * Role / state pills for a user
 */
export function UserPills(props: { user: StaffUser }) {
  return (
    <>
      <Show when={props.user.role === "admin"}>
        <span class={pill({ tone: "accent" })}>Administrador</span>
      </Show>
      <Show when={props.user.role === "mod"}>
        <span class={pill({ tone: "accent" })}>Moderador</span>
      </Show>
      <Show when={props.user.banned}>
        <span class={pill({ tone: "danger" })}>Banido</span>
      </Show>
      <Show when={props.user.bot}>
        <span class={pill()}>Bot</span>
      </Show>
    </>
  );
}

/**
 * Avatar + name + tag
 */
export function UserIdentity(props: { user: StaffUser; size?: number }) {
  const api = useStaffApi();
  return (
    <span class={identity}>
      <Avatar
        size={props.size ?? 28}
        src={api.media("avatars", props.user.avatar)}
        fallback={props.user.displayName ?? props.user.username}
      />
      <span class={identityText}>
        <span class={identityName}>
          {props.user.displayName ?? props.user.username}
        </span>
        <span class={identityTag}>{tagOf(props.user)}</span>
      </span>
    </span>
  );
}

const identity = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--caps-space-4)",
  minWidth: 0,
});
const identityText = css({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
});
const identityName = css({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: "var(--caps-text-md)",
  fontWeight: 500,
  color: "var(--caps-text)",
});
const identityTag = css({
  fontSize: "var(--caps-text-sm)",
  color: "var(--caps-text-3)",
  fontVariantNumeric: "tabular-nums",
});

export const List = styled("div", {
  base: {
    borderRadius: "var(--caps-radius-lg)",
    background: "var(--caps-bg-surface)",
    boxShadow: "inset 0 0 0 1px var(--caps-line-soft)",
    overflow: "hidden",
  },
});

export const row = cva({
  base: {
    all: "unset",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-5)",
    width: "100%",
    minHeight: "52px",
    padding: "var(--caps-space-4) var(--caps-space-6)",
    "&:not(:last-child)": { boxShadow: "inset 0 -1px 0 var(--caps-line-soft)" },
  },
  variants: {
    interactive: {
      true: {
        cursor: "pointer",
        "&:hover": { background: "var(--caps-hover)" },
        "&[aria-selected=true]": {
          background: "var(--caps-selected)",
          boxShadow: "inset 2px 0 0 var(--caps-accent)",
        },
        "&:focus-visible": { boxShadow: "var(--caps-focus-ring)" },
      },
    },
  },
});

export const muted = css({
  fontSize: "var(--caps-text-sm)",
  color: "var(--caps-text-3)",
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
});

export const action = cva({
  base: {
    all: "unset",
    boxSizing: "border-box",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--caps-space-3)",
    height: "32px",
    paddingInline: "var(--caps-space-6)",
    borderRadius: "var(--caps-radius-md)",
    fontSize: "var(--caps-text-md)",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background var(--caps-dur-fast) var(--caps-ease)",
    "&:focus-visible": { boxShadow: "var(--caps-focus-ring)" },
    "&:disabled": { opacity: 0.45, cursor: "not-allowed" },
  },
  variants: {
    tone: {
      primary: {
        background: "var(--caps-accent)",
        color: "var(--caps-on-accent)",
        "&:hover:not(:disabled)": { background: "var(--caps-accent-hover)" },
      },
      neutral: {
        background: "var(--caps-bg-component)",
        color: "var(--caps-text)",
        "&:hover:not(:disabled)": {
          background: "var(--caps-bg-component-hover)",
        },
      },
      danger: {
        background: "var(--caps-danger-soft)",
        color: "var(--caps-danger)",
        "&:hover:not(:disabled)": {
          background: "var(--caps-danger)",
          color: "#fff",
        },
      },
    },
  },
  defaultVariants: { tone: "neutral" },
});

export const ErrorText = styled("div", {
  base: {
    padding: "var(--caps-space-4) var(--caps-space-5)",
    borderRadius: "var(--caps-radius-md)",
    background: "var(--caps-danger-soft)",
    color: "var(--caps-danger)",
    fontSize: "var(--caps-text-md)",
  },
});

/**
 * Confirmation dialog with optional text input (reason / name to type)
 */
export function ConfirmDialog(props: {
  open: boolean;
  title: string;
  description: JSX.Element;
  confirmLabel: string;
  danger?: boolean;
  input?: {
    label: string;
    placeholder?: string;
    mustEqual?: string;
    multiline?: boolean;
  };
  onConfirm: (value: string) => Promise<unknown>;
  onClose: () => void;
}) {
  const [value, setValue] = createSignal("");
  const [busy, setBusy] = createSignal(false);
  const [error, setError] = createSignal<string>();

  const valid = () =>
    !props.input?.mustEqual || value().trim() === props.input.mustEqual;

  async function confirm() {
    if (!valid() || busy()) return;
    setBusy(true);
    setError(undefined);
    try {
      await props.onConfirm(value().trim());
      setValue("");
      props.onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Show when={props.open}>
      <Portal mount={document.getElementById("floating")!}>
        <div
          class={scrim}
          onPointerDown={(e) => e.target === e.currentTarget && props.onClose()}
          onKeyDown={(e) => e.key === "Escape" && props.onClose()}
        >
          <div
            class={dialog}
            role="dialog"
            aria-modal="true"
            aria-label={props.title}
          >
            <h2 class={dialogTitle}>{props.title}</h2>
            <div class={dialogText}>{props.description}</div>
            <Show when={props.input}>
              <label class={fieldLabel}>
                {props.input!.label}
                {props.input!.multiline ? (
                  <textarea
                    class={field}
                    rows={3}
                    value={value()}
                    placeholder={props.input!.placeholder}
                    onInput={(e) => setValue(e.currentTarget.value)}
                    ref={(el) => setTimeout(() => el.focus(), 30)}
                  />
                ) : (
                  <input
                    class={field}
                    value={value()}
                    placeholder={props.input!.placeholder}
                    onInput={(e) => setValue(e.currentTarget.value)}
                    onKeyDown={(e) => e.key === "Enter" && confirm()}
                    ref={(el) => setTimeout(() => el.focus(), 30)}
                  />
                )}
              </label>
            </Show>
            <Show when={error()}>
              <ErrorText>{error()}</ErrorText>
            </Show>
            <div class={dialogActions}>
              <button type="button" class={action()} onClick={props.onClose}>
                Cancelar
              </button>
              <button
                type="button"
                class={action({ tone: props.danger ? "danger" : "primary" })}
                disabled={!valid() || busy()}
                onClick={confirm}
              >
                {busy() ? "Aguarde…" : props.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  );
}

const scrim = css({
  position: "fixed",
  inset: 0,
  zIndex: "var(--caps-z-modal)",
  display: "grid",
  placeItems: "center",
  padding: "var(--caps-space-6)",
  background: "var(--caps-scrim)",
});

const dialog = css({
  display: "flex",
  flexDirection: "column",
  gap: "var(--caps-space-5)",
  width: "min(440px, 100%)",
  padding: "var(--caps-space-8)",
  borderRadius: "var(--caps-radius-xl)",
  background: "var(--caps-bg-overlay)",
  boxShadow: "var(--caps-shadow-modal)",
  animation: "capsPopIn 160ms var(--caps-ease-out)",
});

const dialogTitle = css({
  margin: 0,
  fontSize: "var(--caps-text-xl)",
  fontWeight: 600,
  letterSpacing: "-0.01em",
});

const dialogText = css({
  fontSize: "var(--caps-text-md)",
  lineHeight: 1.5,
  color: "var(--caps-text-2)",
});

const fieldLabel = css({
  display: "flex",
  flexDirection: "column",
  gap: "var(--caps-space-3)",
  fontSize: "var(--caps-text-sm)",
  fontWeight: 600,
  color: "var(--caps-text-2)",
});

const field = css({
  padding: "var(--caps-space-4) var(--caps-space-5)",
  border: "none",
  outline: "none",
  borderRadius: "var(--caps-radius-md)",
  background: "var(--caps-bg-field)",
  boxShadow: "inset 0 0 0 1px var(--caps-line)",
  color: "var(--caps-text)",
  fontFamily: "inherit",
  fontSize: "var(--caps-text-base)",
  resize: "vertical",
  "&:focus": {
    boxShadow:
      "inset 0 0 0 1px var(--caps-accent-line), 0 0 0 3px var(--caps-accent-soft)",
  },
});

const dialogActions = css({
  display: "flex",
  justifyContent: "flex-end",
  gap: "var(--caps-space-3)",
  marginTop: "var(--caps-space-3)",
});
