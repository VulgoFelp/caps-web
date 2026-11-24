import { JSX, Show, children as resolveChildren, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { splitCssProps, styled } from "styled-system/jsx";
import { HTMLStyledProps } from "styled-system/types";

import { SYMBOL_ICONS } from "./symbolIcons";

interface Props {
  /**
   * Emphasised (active) state: drawn with a heavier stroke
   */
  fill?: boolean;
  /**
   * @deprecated kept for compatibility, has no effect
   */
  fontSize?: string | number;
  /**
   * @deprecated kept for compatibility, has no effect
   */
  grade?: number;
  /**
   * @deprecated kept for compatibility, has no effect
   */
  opticalSize?: number | "auto";
  /**
   * @deprecated kept for compatibility, has no effect
   */
  type?: "outlined" | "rounded" | "sharp";
  /**
   * @deprecated kept for compatibility, has no effect
   */
  weight?: number;
  /**
   * Icon name. Material Symbol names are mapped onto the CAPS icon set
   * (Lucide), see `symbolIcons.ts`.
   */
  children: string | JSX.Element;
  /**
   * Icon size in pixels (default 20)
   */
  size?: number;
}

/**
 * CAPS icon by name
 *
 * Historically this rendered the Material Symbols font; it now renders the
 * matching Lucide icon so the whole app shares one icon language.
 */
export function Symbol(rawProps: Props & HTMLStyledProps<"span">) {
  const [local, props] = splitProps(rawProps, [
    "fill",
    "fontSize",
    "grade",
    "opticalSize",
    "weight",
    "type",
    "size",
    "children",
  ]);

  const [cssProps, restProps] = splitCssProps(props);
  const resolved = resolveChildren(() => local.children);

  const icon = () => {
    const name = String(resolved() ?? "").trim();
    const component = SYMBOL_ICONS[name];
    if (!component && name && import.meta.env.DEV) {
      console.warn(`[Symbol] no CAPS icon mapped for "${name}"`);
    }
    return component;
  };

  return (
    <Base
      {...cssProps}
      aria-hidden="true"
      {...restProps}
      // @codegen directives props=props include=floating
    >
      <Show when={icon()}>
        <Dynamic
          component={icon()}
          size={local.size ?? 20}
          strokeWidth={local.fill ? 2.25 : undefined}
        />
      </Show>
    </Base>
  );
}

const Base = styled("span", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    lineHeight: 0,
    userSelect: "none",
  },
});
