import { Match, Switch } from "solid-js";

import { styled } from "styled-system/jsx";

import MdAdd from "lucide-solid/icons/plus";

import { iconSize } from "../utils";

export type Props = {
  unread: boolean;
  count: number;
};

/**
 * Styles for the counter
 */
const UnreadCounter = styled("div", {
  base: {
    width: "10px",
    height: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    fontSize: "8px",
    fontWeight: 600,

    color: "#ffffff",
    fill: "#ffffff",
  },
});

/**
 * Unreads count SVG graphic
 */
function UnreadsGraphic(props: Props) {
  return (
    <Switch>
      <Match when={props.count > 0}>
        <circle cx="27" cy="5" r="5" fill="var(--caps-danger)" />
        <foreignObject x="22" y="0" width="10" height="10">
          <UnreadCounter>
            {props.count < 10 ? props.count : <MdAdd {...iconSize(10)} />}
          </UnreadCounter>
        </foreignObject>
      </Match>
      <Match when={props.unread}>
        <circle cx="27" cy="5" r="5" fill="var(--caps-text)" />
      </Match>
    </Switch>
  );
}

/**
 * Standalone unreads count element
 */
export function Unreads(props: Props & { size: string }) {
  return (
    <svg viewBox="22 0 10 10" height={props.size}>
      <UnreadsGraphic {...props} />
    </svg>
  );
}

Unreads.Graphic = UnreadsGraphic;
