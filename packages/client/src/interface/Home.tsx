import { Show } from "solid-js";

import { Trans } from "@lingui/solid/macro";
import { cva } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { IS_DEV, useClient } from "@revolt/client";
import { useModals } from "@revolt/modal";
import { useNavigate } from "@revolt/routing";
import {
  Button,
  CapsMark,
  CategoryButton,
  Header,
  iconSize,
  main,
} from "@revolt/ui";

import MdAddCircle from "lucide-solid/icons/circle-plus";
import MdHome from "lucide-solid/icons/house";
import MdDesktopWindows from "lucide-solid/icons/monitor";
import MdSettings from "lucide-solid/icons/settings";
import MdPeople from "lucide-solid/icons/users";
import MdGroups3 from "lucide-solid/icons/users-round";

import { HeaderIcon } from "./common/CommonHeader";

/**
 * Windows installer for CAPS Desktop, served by the CAPS server
 */
const WINDOWS_DOWNLOAD_URL = "/download/CAPS-Setup.exe";

/**
 * Offer the desktop app only in a browser on Windows
 */
const showWindowsDownload =
  !window.native && /Windows/i.test(navigator.userAgent);

/**
 * Base layout of the home page (i.e. the header/background)
 */
const Base = styled("div", {
  base: {
    width: "100%",
    display: "flex",
    flexDirection: "column",

    color: "var(--caps-text)",
  },
});

/**
 * Layout of the content as a whole
 */
const content = cva({
  base: {
    ...main.raw(),

    padding: "72px 40px",
    gap: "var(--caps-space-9)",
    alignItems: "center",

    "& > *": {
      width: "100%",
      maxWidth: "560px",
    },

    _phone: {
      padding: "32px 16px",
    },
  },
});

const Hero = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "var(--caps-space-3)",
  },
});

const Mark = styled("div", {
  base: {
    display: "grid",
    placeItems: "center",
    width: "52px",
    height: "52px",
    marginBottom: "var(--caps-space-5)",
    borderRadius: "var(--caps-radius-server)",
    color: "var(--caps-on-accent)",
    background: "var(--caps-accent)",
  },
});

const Greeting = styled("h1", {
  base: {
    margin: 0,
    fontSize: "var(--caps-text-3xl)",
    fontWeight: 600,
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
  },
});

const Tagline = styled("p", {
  base: {
    margin: 0,
    fontSize: "var(--caps-text-lg)",
    color: "var(--caps-text-2)",
    lineHeight: 1.5,
  },
});

const Section = styled("section", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--caps-space-4)",
  },
});

const SectionTitle = styled("h2", {
  base: {
    margin: 0,
    fontSize: "var(--caps-text-xs)",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--caps-text-3)",
  },
});

/**
 * Home page
 */
export function HomePage() {
  const { openModal } = useModals();
  const navigate = useNavigate();
  const client = useClient();

  return (
    <Base>
      <Header placement="primary">
        <HeaderIcon>
          <MdHome {...iconSize(20)} />
        </HeaderIcon>
        <Trans>Home</Trans>
      </Header>
      <div use:scrollable={{ class: content() }}>
        <Hero>
          <Mark aria-hidden="true">
            <CapsMark size={28} mono />
          </Mark>
          <Greeting>Olá, {client()!.user?.displayName}</Greeting>
          <Tagline>
            Suas comunidades, conversas e salas de voz em um só lugar.
          </Tagline>
        </Hero>

        <Section>
          <SectionTitle>Começar</SectionTitle>
          <CategoryButton.Group>
            <CategoryButton
              onClick={() =>
                openModal({
                  type: "create_group_or_server",
                  client: client()!,
                })
              }
              description={
                <Trans>
                  Invite all of your friends, some cool bots, and throw a big
                  party.
                </Trans>
              }
              icon={<MdAddCircle />}
              action="chevron"
            >
              <Trans>Create a group or server</Trans>
            </CategoryButton>
            <CategoryButton
              onClick={() =>
                openModal({ type: "join_server", client: client()! })
              }
              description="Recebeu um convite? Cole o link ou o código."
              icon={<MdGroups3 />}
              action="chevron"
            >
              Entrar com um convite
            </CategoryButton>
            <CategoryButton
              onClick={() => navigate("/friends")}
              description="Adicione amigos e veja quem está online."
              icon={<MdPeople />}
              action="chevron"
            >
              <Trans>Friends</Trans>
            </CategoryButton>
          </CategoryButton.Group>
        </Section>

        <Section>
          <SectionTitle>Conta</SectionTitle>
          <CategoryButton.Group>
            <CategoryButton
              onClick={() => openModal({ type: "settings", config: "user" })}
              description="Perfil, aparência, notificações, voz e vídeo."
              icon={<MdSettings />}
              action="chevron"
            >
              <Trans>Open settings</Trans>
            </CategoryButton>
            <Show when={showWindowsDownload}>
              <CategoryButton
                onClick={() => window.open(WINDOWS_DOWNLOAD_URL, "_blank")}
                description="Instale o CAPS no PC: abre com o Windows, fica na bandeja e avisa das mensagens."
                icon={<MdDesktopWindows />}
                action="external"
              >
                Baixar o app para Windows
              </CategoryButton>
            </Show>
          </CategoryButton.Group>
        </Section>

        <Show when={IS_DEV}>
          <Button variant="tonal" onPress={() => navigate("/dev")}>
            Open Development Page
          </Button>
        </Show>
      </div>
    </Base>
  );
}
