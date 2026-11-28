import { createSignal } from "solid-js";

import { registerSW } from "virtual:pwa-register";

const [pendingUpdate, setPendingUpdate] = createSignal<() => void>();

export { pendingUpdate };

/**
 * Right after the app opens, a new version is applied straight away (the
 * page reloads before the user gets going). Later on we only offer the
 * "Update" button so nobody loses what they are typing.
 */
const AUTO_APPLY_WINDOW = 45_000;
const openedAt = Date.now();

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    if (Date.now() - openedAt < AUTO_APPLY_WINDOW) {
      void updateSW(true);
    } else {
      setPendingUpdate(() => void updateSW(true));
    }
  },
  onOfflineReady() {
    console.info("Ready to work offline =)");
  },
  onRegistered(r) {
    // check on open, then every 30 minutes
    void r?.update();
    setInterval(() => r?.update(), 30 * 60_000);
  },
});
