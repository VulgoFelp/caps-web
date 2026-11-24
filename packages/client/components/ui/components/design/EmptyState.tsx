import { JSX, Show } from "solid-js";

import { styled } from "styled-system/jsx";

/**
 * Empty / zero state: icon, title, short description and optional actions
 */
export function EmptyState(props: {
  icon?: JSX.Element;
  title: JSX.Element;
  description?: JSX.Element;
  actions?: JSX.Element;
  /**
   * Smaller variant for panels and lists
   */
  compact?: boolean;
}) {
  return (
    <Base compact={props.compact}>
      <Show when={props.icon}>
        <Icon aria-hidden="true">{props.icon}</Icon>
      </Show>
      <Title>{props.title}</Title>
      <Show when={props.description}>
        <Description>{props.description}</Description>
      </Show>
      <Show when={props.actions}>
        <Actions>{props.actions}</Actions>
      </Show>
    </Base>
  );
}

const Base = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "var(--caps-space-3)",
    maxWidth: "380px",
    marginInline: "auto",
    padding: "var(--caps-space-10) var(--caps-space-8)",
    animation: "authHintIn 240ms var(--caps-ease-out)",
  },
  variants: {
    compact: {
      true: { padding: "var(--caps-space-8) var(--caps-space-6)" },
    },
  },
});

const Icon = styled("div", {
  base: {
    display: "grid",
    placeItems: "center",
    width: "48px",
    height: "48px",
    marginBottom: "var(--caps-space-4)",
    borderRadius: "var(--caps-radius-lg)",
    background: "var(--caps-bg-component)",
    color: "var(--caps-text-2)",
    boxShadow: "inset 0 0 0 1px var(--caps-line-soft)",
  },
});

const Title = styled("h2", {
  base: {
    margin: 0,
    fontSize: "var(--caps-text-lg)",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    color: "var(--caps-text)",
  },
});

const Description = styled("p", {
  base: {
    margin: 0,
    fontSize: "var(--caps-text-md)",
    lineHeight: 1.5,
    color: "var(--caps-text-3)",
  },
});

const Actions = styled("div", {
  base: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "var(--caps-space-4)",
    marginTop: "var(--caps-space-5)",
  },
});
