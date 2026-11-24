import Instance from "@revolt/instance/Instance";
import { paramsFromPathname } from "@revolt/routing";

import { AbstractStore } from ".";
import { State } from "..";

/**
 * Static section IDs
 */
export enum LAYOUT_SECTIONS {
  PRIMARY_SIDEBAR = "PRIMARY_SIDEBAR",
  MEMBER_SIDEBAR = "MEMBER_SIDEBAR",
  MENTION_REPLY = "MENTION_REPLY",
  MATURE = "nsfw",
}

export interface TypeLayout {
  /**
   * The current section of the program we are in
   *
   * This can currently either be:
   * - home
   * - discover
   * - a server ID
   */
  activeInterface: "home" | "discover" | string;

  /**
   * Current path within an interface
   */
  activePath: Record<TypeLayout["activeInterface"], string>;

  /**
   * Open (or closed) sections of the UI
   *
   * Only the contrary is ever stored
   */
  openSections: Record<string, boolean>;

  /**
   * Panel widths in pixels (sidebar, side panel), resizable by the user
   */
  sizes: Record<string, number>;
}

/**
 * Resizable panels and their limits
 */
export const LAYOUT_SIZES = {
  SIDEBAR: { key: "sidebar", min: 208, max: 380, default: 264 },
  SIDE_PANEL: { key: "panel", min: 240, max: 440, default: 280 },
} as const;

/**
 * Handles layout and navigation of the app.
 */
export class Layout extends AbstractStore<"layout", TypeLayout> {
  /**
   * Construct store
   * @param state State
   */
  constructor(state: State) {
    super(state, "layout");
  }

  /**
   * Hydrate external context
   */
  hydrate(): void {
    /** nothing needs to be done */
  }

  /**
   * Generate default values
   */
  default(): TypeLayout {
    return {
      activeInterface: "home",
      activePath: {},
      openSections: {},
      sizes: {},
    };
  }

  /**
   * Validate the given data to see if it is compliant and return a compliant object
   */
  clean(input: Partial<TypeLayout>): TypeLayout {
    const layout: TypeLayout = this.default();

    if (typeof input.activeInterface === "string") {
      layout.activeInterface = input.activeInterface;
    }

    if (typeof input.activePath === "object") {
      for (const interfaceId of Object.keys(input.activePath)) {
        if (typeof input.activePath[interfaceId] === "string") {
          layout.activePath[interfaceId] = Instance.relPath(
            input.activePath[interfaceId],
          );
        }
      }
    }

    if (typeof input.openSections === "object") {
      for (const section of Object.keys(input.openSections)) {
        if (typeof input.openSections[section] === "boolean") {
          layout.openSections[section] = input.openSections[section];
        }
      }
    }

    if (typeof input.sizes === "object" && input.sizes) {
      for (const key of Object.keys(input.sizes)) {
        if (typeof input.sizes[key] === "number") {
          layout.sizes[key] = input.sizes[key];
        }
      }
    }

    return layout;
  }

  /**
   * Get a panel size, clamped to its limits
   * @param size Panel definition from LAYOUT_SIZES
   */
  getSize(size: (typeof LAYOUT_SIZES)[keyof typeof LAYOUT_SIZES]) {
    const value = this.get().sizes?.[size.key] ?? size.default;
    return Math.min(size.max, Math.max(size.min, value));
  }

  /**
   * Set a panel size (clamped)
   * @param size Panel definition from LAYOUT_SIZES
   * @param value Width in pixels
   */
  setSize(
    size: (typeof LAYOUT_SIZES)[keyof typeof LAYOUT_SIZES],
    value: number,
  ) {
    this.set(
      "sizes",
      size.key,
      Math.round(Math.min(size.max, Math.max(size.min, value))),
    );
  }

  /**
   * Get the last active path in the app
   */
  getLastActivePath() {
    const section = this.get().activeInterface;
    return this.get().activePath[section] ?? "/";
  }

  /**
   * Get the last active discover path in the app
   */
  getLastActiveDiscoverPath() {
    return this.get().activePath["discover"] ?? "/discover/servers";
  }

  /**
   * Get the last active server path
   */
  getLastActiveServerPath(serverId: string) {
    return this.get().activePath[serverId] ?? `/server/${serverId}`;
  }

  /**
   * Set the last active path in the app
   */
  setLastActivePath(pathname: string) {
    if (
      pathname.startsWith("/settings") ||
      pathname.startsWith("/invite") ||
      pathname.startsWith("/login")
    )
      return;

    const params = paramsFromPathname(pathname);
    const section = pathname.startsWith("/discover")
      ? "discover"
      : (params.serverId ?? "home");
    this.set("activeInterface", section);
    this.set("activePath", section, Instance.relPath(pathname));
  }

  /**
   * Get state of a section
   * @param id Section ID
   * @param defaultValue Default state value
   * @returns Whether the section is open
   */
  getSectionState(id: string, defaultValue = false) {
    return this.get().openSections[id] ?? defaultValue;
  }

  /**
   * Set the state of a section
   * @param id Section ID
   * @param value New state value
   * @param defaultValue Default state value
   */
  setSectionState(id: string, value: boolean, defaultValue = false) {
    this.set("openSections", id, value === defaultValue ? undefined! : value);
  }

  /**
   * Toggle state of a section
   * @param id Section ID
   * @param defaultValue Default state value
   */
  toggleSectionState(id: string, defaultValue?: boolean) {
    this.setSectionState(
      id,
      !this.getSectionState(id, defaultValue),
      defaultValue,
    );
  }
}
