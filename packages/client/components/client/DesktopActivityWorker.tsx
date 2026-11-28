import { createEffect, createSignal, on, onCleanup } from "solid-js";

import { useClient } from ".";

/**
 * CAPS Desktop bridge exposed by the preload script (only inside CAPS Desktop,
 * and only reports games when the user opted in)
 */
declare global {
  interface Window {
    desktopActivity?: {
      /**
       * Name of the game currently detected, or null
       */
      current(): string | null;
      /**
       * Subscribe to changes, returns an unsubscribe function
       */
      subscribe(callback: (game: string | null) => void): () => void;
      /**
       * Every game the desktop app knows how to detect
       */
      games(): string[];
    };
  }
}

/**
 * CAPS: forward the game detected by CAPS Desktop to the API
 *
 * Detection runs locally in the desktop app; only the game name is sent,
 * and only after the user enabled it in the desktop settings.
 */
export function DesktopActivityWorker() {
  const bridge = window.desktopActivity;
  if (!bridge) return null;

  const client = useClient();
  const [game, setGame] = createSignal(bridge.current());
  onCleanup(bridge.subscribe(setGame));

  let inflight: Promise<unknown> = Promise.resolve();
  let sent: string | null | undefined;

  createEffect(
    on(
      () => {
        const user = client().ready() ? client().user : undefined;
        return [
          user,
          user?.activity?.name ?? null,
          // `user.activity` reads as empty while we are offline / invisible
          !user?.online || user?.presence === "Invisible",
          game(),
        ] as const;
      },
      ([user, current, hidden, game]) => {
        if (!user || current === game) return;
        // while hidden we cannot see our own activity, so trust what we sent
        if (hidden && sent === game) return;

        sent = game;
        inflight = inflight
          .then(() => (game ? user.setActivity(game) : user.clearActivity()))
          .catch((err) =>
            console.warn("[caps] failed to update activity", err),
          );
      },
    ),
  );

  return null;
}
