import { For, Show, createSignal, onCleanup, onMount } from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";

import { CategoryButton, Checkbox, Column } from "@revolt/ui";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

declare type DesktopConfig = {
  firstLaunch: boolean;
  customFrame: boolean;
  minimiseToTray: boolean;
  startMinimisedToTray: boolean;
  spellchecker: boolean;
  hardwareAcceleration: boolean;
  discordRpc: boolean;
  /**
   * CAPS: share the game being played (opt-in, CAPS Desktop 1.2+)
   */
  gameActivity?: boolean;
  /**
   * CAPS: games never shared even with gameActivity on
   */
  hiddenGames?: string[];
  windowState: {
    isMaximised: boolean;
  };
};

declare global {
  interface Window {
    native: {
      versions: {
        node(): string;
        chrome(): string;
        electron(): string;
        desktop(): string;
      };
      minimise(): void;
      maximise(): void;
      close(): void;
      onceScreenPicker(
        onScreenPick: (
          sources: {
            idx: number;
            name: string;
            isFullScreen: boolean;
            image?: string;
          }[],
        ) => void,
      ): void;
      screenPickerCallback(idx: number, audio: boolean): void;
      isWayland?(): Promise<boolean>;
    };

    desktopConfig: {
      get(): DesktopConfig;
      set(config: Partial<DesktopConfig>): void;
      getAutostart(): Promise<boolean>;
      setAutostart(value: boolean): Promise<boolean>;
    };
  }
}

/**
 * Desktop Configuration Page
 */
export default function Native() {
  const { t } = useLingui();
  const [autostart, setAutostart] = createSignal(false);
  const [config, setConfig] = createSignal(window.desktopConfig.get());

  function set(config: Partial<DesktopConfig>) {
    window.desktopConfig.set(config);
    setConfig((conf) => ({ ...conf, ...config }));
  }

  onMount(async () => {
    const value = await window.desktopConfig.getAutostart();
    setAutostart(value);
  });

  async function toggleAutostart() {
    const newValue = !autostart();
    const savedValue = await window.desktopConfig.setAutostart(newValue);
    setAutostart(savedValue);
  }

  const toggles: Partial<Record<keyof DesktopConfig, () => void>> = {
    minimiseToTray: () => set({ minimiseToTray: !config().minimiseToTray }),
    startMinimisedToTray: () =>
      set({ startMinimisedToTray: !config().startMinimisedToTray }),
    customFrame: () => set({ customFrame: !config().customFrame }),
    discordRpc: () => set({ discordRpc: !config().discordRpc }),
    spellchecker: () => set({ spellchecker: !config().spellchecker }),
    hardwareAcceleration: () =>
      set({ hardwareAcceleration: !config().hardwareAcceleration }),
    gameActivity: () => set({ gameActivity: !config().gameActivity }),
  };

  // CAPS: game currently detected by the desktop app (local only)
  const [detected, setDetected] = createSignal(
    window.desktopActivity?.current() ?? null,
  );
  if (window.desktopActivity) {
    onCleanup(window.desktopActivity.subscribe(setDetected));
  }
  const hiddenGames = () => config().hiddenGames ?? [];
  const hideGame = (name: string) =>
    set({ hiddenGames: [...new Set([...hiddenGames(), name])] });
  const showGame = (name: string) =>
    set({ hiddenGames: hiddenGames().filter((game) => game !== name) });

  function CheckboxButton<
    K extends keyof Omit<DesktopConfig, "windowState" | "hiddenGames">,
  >(key: K, icon: string, label: string, description: string) {
    return (
      <CategoryButton
        action={<Checkbox checked={!!config()[key]} />}
        onClick={toggles[key]}
        icon={<Symbol>{icon}</Symbol>}
        description={description}
      >
        {label}
      </CategoryButton>
    );
  }

  return (
    <Column gap="lg">
      <CategoryButton.Group>
        <CategoryButton
          action={<Checkbox checked={autostart()} />}
          onClick={toggleAutostart}
          icon={<Symbol>exit_to_app</Symbol>}
          description={
            <Trans>Launch Stoat when you log into your computer.</Trans>
          }
        >
          <Trans>Start with Computer</Trans>
        </CategoryButton>
        {autostart() &&
          CheckboxButton(
            "startMinimisedToTray",
            "minimize",
            t`Start Minimised to Tray`,
            t`Stoat will start in the system tray.`,
          )}
        {CheckboxButton(
          "minimiseToTray",
          "cancel_presentation",
          t`Minimise to Tray`,
          t`Instead of closing, Stoat will hide in your tray.`,
        )}
        {CheckboxButton(
          "customFrame",
          "web_asset",
          t`Custom window frame`,
          t`Let Stoat use its own custom titlebar.`,
        )}
      </CategoryButton.Group>

      <CategoryButton.Group>
        {CheckboxButton(
          "spellchecker",
          "spellcheck",
          t`Spellchecker`,
          t`Show corrections and suggestions as you type.`,
        )}
        {CheckboxButton(
          "hardwareAcceleration",
          "speed",
          t`Hardware Acceleration`,
          t`Use the graphics card to improve performance.`,
        )}
      </CategoryButton.Group>

      <Show when={window.desktopActivity}>
        <CategoryButton.Group>
          {CheckboxButton(
            "gameActivity",
            "sports_esports",
            t`Show the game I'm playing`,
            t`Detects games from a built-in list on this computer and shares only the game name with friends and people in your communities. Off by default.`,
          )}
          <Show when={config().gameActivity && detected()}>
            <CategoryButton
              icon={<Symbol>visibility_off</Symbol>}
              description={t`Detected now: ${detected()}`}
              onClick={() => hideGame(detected()!)}
            >
              <Trans>Hide this game</Trans>
            </CategoryButton>
          </Show>
          <For each={hiddenGames()}>
            {(game) => (
              <CategoryButton
                icon={<Symbol>visibility</Symbol>}
                description={t`Hidden: never shared`}
                onClick={() => showGame(game)}
              >
                <Trans>Show {game} again</Trans>
              </CategoryButton>
            )}
          </For>
        </CategoryButton.Group>
      </Show>

      <CategoryButton.Group>
        <CategoryButton
          icon={<Symbol>desktop_windows</Symbol>}
          description={
            <>
              <Trans>Version:</Trans> {window.native.versions.desktop()}
            </>
          }
        >
          <Trans>Stoat for Desktop</Trans>
        </CategoryButton>
      </CategoryButton.Group>
    </Column>
  );
}
