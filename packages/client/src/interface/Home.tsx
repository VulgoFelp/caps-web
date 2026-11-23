import { Show } from "solid-js";

import { Trans } from "@lingui/solid/macro";
import { cva } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { IS_DEV, useClient } from "@revolt/client";
import { useModals } from "@revolt/modal";
import { useNavigate } from "@revolt/routing";
import { Button, CategoryButton, Header, iconSize, main } from "@revolt/ui";

import MdAddCircle from "@material-design-icons/svg/filled/add_circle.svg?component-solid";
import MdGroups3 from "@material-design-icons/svg/filled/groups_3.svg?component-solid";
import MdHome from "@material-design-icons/svg/filled/home.svg?component-solid";
import MdSettings from "@material-design-icons/svg/filled/settings.svg?component-solid";
import MdPeople from "@material-design-icons/svg/outlined/people.svg?component-solid";

import { HeaderIcon } from "./common/CommonHeader";

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
            <svg
              viewBox="0 0 24 24"
              width="28"
              height="28"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
            >
              <path d="M12.6 12.2c.5-.6.1-1.6-.8-1.6-1.2 0-1.9 1.3-1.4 2.4.7 1.5 2.8 1.8 4 .7 1.6-1.5 1.2-4.2-.6-5.3-2.3-1.4-5.4-.4-6.5 2-1.4 3 .3 6.5 3.4 7.4 3.7 1.1 7.4-1.4 8-5.1" />
            </svg>
          </Mark>
          <Greeting>E aí, {client()!.user?.displayName ?? "galera"}</Greeting>
          <Tagline>
            Coisa de doido. Chat, voz, vídeo e tela da galera, num lugar só.
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
              description="Adicione a galera e veja quem está online."
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
