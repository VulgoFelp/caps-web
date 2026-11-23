import { Symbol } from "../utils/Symbol";

import { styled } from "styled-system/jsx";

import { Ripple } from "./Ripple";

export const Switch = {
  Override: OverrideSwitch,
};

type State = "allow" | "neutral" | "deny";

interface Props {
  readonly value: State;
  readonly disabled?: boolean;
  readonly onChange: (state: State) => void;
}

/**
 * Override Switch
 */
function OverrideSwitch(props: Props) {
  return (
    <SwitchContainer
      role="radiogroup"
      aria-orientiation="horizontal"
      aria-disabled={props.disabled}
    >
      <Override
        type="allow"
        selected={props.value}
        onClick={() => !props.disabled && props.onChange("allow")}
        role="radio"
      >
        <Ripple />
        <Symbol size={20}>check</Symbol>
      </Override>
      <Override
        type="neutral"
        selected={props.value}
        onClick={() => !props.disabled && props.onChange("neutral")}
        role="radio"
      >
        <Ripple />
        <Symbol size={20}>remove</Symbol>
      </Override>
      <Override
        type="deny"
        selected={props.value}
        onClick={() => !props.disabled && props.onChange("deny")}
        role="radio"
      >
        <Ripple />
        <Symbol size={20}>close</Symbol>
      </Override>
    </SwitchContainer>
  );
}

const SwitchContainer = styled("div", {
  base: {
    flexShrink: 0,
    display: "inline-flex",
    gap: "2px",
    padding: "2px",
    margin: "2px 0",
    overflow: "hidden",
    borderRadius: "var(--caps-radius-md)",
    background: "var(--caps-bg-field)",
    boxShadow: "inset 0 0 0 1px var(--caps-line)",

    transition: "opacity var(--caps-dur-fast) var(--caps-ease)",
  },
});

const Override = styled("div", {
  base: {
    // for <Ripple />:
    position: "relative",

    width: "28px",
    height: "24px",
    flex: "0 0 28px",
    display: "flex",
    cursor: "pointer",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--caps-radius-sm)",
    color: "var(--caps-text-3)",
    fill: "var(--caps-text-3)",
    transition:
      "background-color var(--caps-dur-fast) var(--caps-ease), color var(--caps-dur-fast) var(--caps-ease)",

    "--md-ripple-hover-opacity": "0",
    "--md-ripple-pressed-opacity": "0.08",

    "&:hover": {
      color: "var(--caps-text)",
      background: "var(--caps-hover)",
    },

    "& > span": {
      lineHeight: 1,
      fontSize: "16px !important",
    },
  },
  variants: {
    selected: {
      allow: {},
      neutral: {},
      deny: {},
    },
    type: {
      allow: {},
      neutral: {},
      deny: {},
    },
  },
  compoundVariants: [
    {
      type: "allow",
      selected: "allow",
      css: {
        color: "var(--caps-success)",
        background: "rgba(58, 191, 126, 0.16)",
        "&:hover": {
          color: "var(--caps-success)",
          background: "rgba(58, 191, 126, 0.16)",
        },
      },
    },
    {
      type: "neutral",
      selected: "neutral",
      css: {
        color: "var(--caps-text)",
        background: "var(--caps-selected)",
        "&:hover": {
          background: "var(--caps-selected)",
        },
      },
    },
    {
      type: "deny",
      selected: "deny",
      css: {
        color: "var(--caps-danger)",
        background: "var(--caps-danger-soft)",
        "&:hover": {
          color: "var(--caps-danger)",
          background: "var(--caps-danger-soft)",
        },
      },
    },
  ],
});
