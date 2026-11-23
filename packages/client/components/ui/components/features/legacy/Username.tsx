import { splitProps } from "solid-js";
import { css } from "styled-system/css";

import { typography } from "../../design/Text";
import { ColouredText } from "../../utils/ColouredText";

type Props = {
  /**
   * Username
   */
  username?: string;

  /**
   * Text colour
   */
  colour?: string;
};

/**
 * Username
 *
 * @deprecated this seems unideal
 */
export function Username(props: Props) {
  const [local, remote] = splitProps(props, ["username", "colour"]);

  return (
    <span
      {...remote}
      class={
        typography({ class: "label", size: "large" }) +
        " " +
        css({
          fontSize: "var(--caps-text-base)",
          fontWeight: 600,
          letterSpacing: "-0.005em",
          cursor: "pointer",
          "&:hover": { textDecoration: "underline" },
        })
      }
    >
      <ColouredText colour={local.colour!}>{local.username}</ColouredText>
    </span>
  );
}
