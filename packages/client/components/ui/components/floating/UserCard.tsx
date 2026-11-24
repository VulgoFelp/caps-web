import { useQuery } from "@tanstack/solid-query";
import { For, JSX, Show, createMemo, createSignal, onMount } from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { useClient } from "@revolt/client";
import { useDevice } from "@revolt/common";
import { timeLocale, useTime } from "@revolt/i18n";
import { Markdown } from "@revolt/markdown";
import { useModals } from "@revolt/modal";

import { Avatar, CapsMark, UserStatus } from "../design";
import { StaffBadge } from "../features";
import { ProfileActions } from "../features/profiles/ProfileActions";
import { ProfileBadges } from "../features/profiles/ProfileBadges";

/**
 * How many roles are shown before collapsing into "+N"
 */
const MAX_ROLES = 8;

/**
 * User Card
 *
 * Compact profile popover shown when clicking a user in the chat. It is
 * composed as a single surface (no nested cards): cover strip with quiet
 * actions, identity block, primary action, then light sections divided by
 * hairlines. Height follows the content.
 */
export function UserCard(
  props: JSX.Directives["floating"]["userCard"] &
    object & { onClose: () => void },
) {
  const { t } = useLingui();
  const dayjs = useTime();
  const client = useClient();
  const { isMobile } = useDevice();
  const { openModal } = useModals();

  const query = useQuery(() => ({
    queryKey: ["profile", props.user.id],
    queryFn: () => props.user.fetchProfile(),
  }));

  const ownerQuery = useQuery(() => ({
    queryKey: ["owner", props.bot?.owner],
    enabled: !!props.bot?.owner,
    queryFn: async () =>
      client().users.get(props.bot!.owner) ??
      (await client().users.fetch(props.bot!.owner)),
  }));

  function openFull() {
    openModal({ type: "user_profile", user: props.user, member: props.member });
    props.onClose();
  }

  onMount(() => {
    if (isMobile) openFull();
  });

  // ------------------------------------------------------------- identity
  const displayName = () => props.member?.displayName ?? props.user.displayName;
  const pronouns = () => props.member?.pronouns ?? props.user.pronouns;

  const [copied, setCopied] = createSignal(false);
  function copyUsername() {
    navigator.clipboard.writeText(
      `${props.user.username}#${props.user.discriminator}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const presenceLabel = () => {
    switch (props.user.presence) {
      case "Online":
        return t`Online`;
      case "Idle":
        return t`Idle`;
      case "Focus":
        return t`Focus`;
      case "Busy":
        return t`Busy`;
      default:
        return t`Offline`;
    }
  };

  const customStatus = () => props.user.status?.text;

  // ---------------------------------------------------------------- roles
  const roles = createMemo(() =>
    props.member
      ? props.member.orderedRoles
          .filter((r) =>
            props.member?.server ? props.member.server.roles.has(r.id) : true,
          )
          .toReversed()
      : [],
  );

  function openRoles() {
    openModal({ type: "user_profile_roles", member: props.member! });
  }

  // -------------------------------------------------------------- joined
  const formatDate = (date: Date) =>
    dayjs(date).format(
      timeLocale()[1]
        .formats.L?.replace("MM", "MMM")
        .replaceAll("/", " ")
        .replaceAll("-", " "),
    );

  // ---------------------------------------------------------------- cover
  const accent = () => props.member?.roleColour ?? undefined;
  const coverStyle = () => {
    const banner = query.data?.animatedBannerURL;
    if (banner) return { "background-image": `url('${banner}')` };
    // no banner: graphite tinted by the member's role colour, if any
    return accent()
      ? {
          "background-color": `color-mix(in srgb, ${accent()} 22%, var(--caps-bg-inset))`,
        }
      : {};
  };

  return (
    <Show when={!isMobile}>
      <div
        use:invisibleScrollable={{ class: base }}
        on:pointerdown={(e) => {
          e.preventDefault();
        }}
      >
        <Cover style={coverStyle()} hasImage={!!query.data?.animatedBannerURL}>
          <CoverActions>
            <ProfileActions
              slot="secondary"
              width={2}
              user={props.user}
              member={props.member}
              onClose={props.onClose}
            />
          </CoverActions>
        </Cover>

        <Body>
          <AvatarRing>
            <Avatar
              src={props.user.animatedAvatarURL}
              size={72}
              holepunch="bottom-right"
              onClick={openFull}
              interactive
              overlay={<UserStatus.Graphic status={props.user.presence} />}
            />
          </AvatarRing>

          <Identity>
            <NameRow>
              <Name>{displayName()}</Name>
              <StaffBadge badges={props.user.badges} />
            </NameRow>

            <Handle>
              <button
                type="button"
                class={handleButton}
                onClick={copyUsername}
                use:floating={{
                  tooltip: {
                    placement: "top",
                    content: copied() ? t`Copied!` : t`Click to copy username`,
                  },
                }}
              >
                {props.user.username}
                <span class={css({ color: "var(--caps-text-3)" })}>
                  #{props.user.discriminator}
                </span>
              </button>
              <Show when={pronouns()}>
                <Dot aria-hidden="true">·</Dot>
                <span>{pronouns()}</span>
              </Show>
            </Handle>

            <Presence>
              <UserStatus status={props.user.presence} size="8px" />
              <span>{presenceLabel()}</span>
              <Show when={customStatus()}>
                <Dot aria-hidden="true">·</Dot>
                <CustomStatus title={customStatus() ?? undefined}>
                  {customStatus()}
                </CustomStatus>
              </Show>
            </Presence>

            <ProfileBadges user={props.user} bare />
          </Identity>

          <Show
            when={
              (props.user.relationship !== "User" &&
                props.user.relationship !== "Blocked" &&
                props.user.relationship !== "BlockedOther") ||
              props.user.bot
            }
          >
            <PrimaryActions>
              <ProfileActions
                slot="primary"
                width={2}
                user={props.user}
                member={props.member}
                onClose={props.onClose}
              />
            </PrimaryActions>
          </Show>

          <Show when={query.data?.content}>
            <Section>
              <SectionLabel>
                <Trans>Bio</Trans>
              </SectionLabel>
              <Bio>
                <Markdown content={query.data!.content!} />
              </Bio>
            </Section>
          </Show>

          <Show when={roles().length}>
            <Section>
              <SectionLabel>
                <Trans>Roles</Trans>
              </SectionLabel>
              <Chips>
                <For each={roles().slice(0, MAX_ROLES)}>
                  {(role) => (
                    <Chip type="button" onClick={openRoles} title={role.name}>
                      <ChipDot
                        style={{
                          background: role.colour ?? "var(--caps-text-3)",
                        }}
                      />
                      <ChipLabel>{role.name}</ChipLabel>
                    </Chip>
                  )}
                </For>
                <Show when={roles().length > MAX_ROLES}>
                  <Chip type="button" onClick={openRoles}>
                    +{roles().length - MAX_ROLES}
                  </Chip>
                </Show>
              </Chips>
            </Section>
          </Show>

          <Show when={props.bot && ownerQuery.data}>
            <Section>
              <SectionLabel>
                <Trans>Owner</Trans>
              </SectionLabel>
              <OwnerRow
                type="button"
                onClick={() => {
                  openModal({ type: "user_profile", user: ownerQuery.data! });
                  props.onClose();
                }}
              >
                <Avatar
                  src={ownerQuery.data!.animatedAvatarURL}
                  fallback={ownerQuery.data!.displayName}
                  size={20}
                />
                <span>{ownerQuery.data!.displayName}</span>
              </OwnerRow>
            </Section>
          </Show>

          <Section>
            <SectionLabel>
              <Trans>Joined</Trans>
            </SectionLabel>
            <Facts>
              <Fact>
                <FactIcon aria-hidden="true">
                  <CapsMark size={14} mono />
                </FactIcon>
                <span>CAPS</span>
                <FactValue>{formatDate(props.user.createdAt)}</FactValue>
              </Fact>
              <Show when={props.member}>
                <Fact>
                  <FactIcon aria-hidden="true">
                    <Avatar
                      size={16}
                      shape="rounded-square"
                      src={props.member!.server!.iconURL}
                      fallback={props.member!.server!.name}
                    />
                  </FactIcon>
                  <FactServer>{props.member!.server!.name}</FactServer>
                  <FactValue>{formatDate(props.member!.joinedAt)}</FactValue>
                </Fact>
              </Show>
            </Facts>
          </Section>

          <FullProfile type="button" onClick={openFull}>
            <Trans>View full profile</Trans>
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
          </FullProfile>
        </Body>
      </div>
    </Show>
  );
}

/**
 * Popover surface
 */
const base = css({
  width: "320px",
  maxHeight: "min(640px, calc(100vh - 16px))",
  overflowY: "auto",

  color: "var(--caps-text)",
  background: "var(--caps-bg-overlay)",
  borderRadius: "var(--caps-radius-lg)",
  boxShadow: "var(--caps-shadow-pop)",

  animation: "capsPopIn 160ms var(--caps-ease-out)",
  transformOrigin: "left top",
});

const Cover = styled("div", {
  base: {
    position: "relative",
    height: "88px",
    backgroundColor: "var(--caps-bg-inset)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderBottom: "1px solid var(--caps-line-soft)",
  },
  variants: {
    hasImage: {
      true: {
        // keeps the overlaid actions legible on any banner
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0) 50%)",
        },
      },
    },
  },
});

const CoverActions = styled("div", {
  base: {
    position: "absolute",
    zIndex: 1,
    top: "8px",
    right: "8px",
    padding: "2px",
    borderRadius: "var(--caps-radius-md)",
    background: "rgba(12, 12, 11, 0.55)",
    backdropFilter: "blur(6px)",

    "& button": {
      width: "28px",
      height: "28px",
      "--colour": "#ecebe4",
    },

    "& button:hover": {
      background: "rgba(255, 255, 255, 0.12)",
    },

    "& svg": {
      width: "18px",
      height: "18px",
    },
  },
});

const Body = styled("div", {
  base: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    padding: "0 var(--caps-space-6) var(--caps-space-4)",
  },
});

const AvatarRing = styled("div", {
  base: {
    width: "fit-content",
    marginTop: "-40px",
    padding: "4px",
    borderRadius: "50%",
    background: "var(--caps-bg-overlay)",
    transition: "transform var(--caps-dur) var(--caps-ease-out)",

    "&:hover": {
      transform: "scale(1.03)",
    },
  },
});

const Identity = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--caps-space-2)",
    paddingTop: "var(--caps-space-4)",
    paddingBottom: "var(--caps-space-5)",
    minWidth: 0,

    // badge row from <ProfileBadges bare />
    "& > div:last-child:not(:empty)": {
      marginTop: "var(--caps-space-3)",
    },
  },
});

const NameRow = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-3)",
    minWidth: 0,
  },
});

const Name = styled("h2", {
  base: {
    margin: 0,
    minWidth: 0,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    fontSize: "var(--caps-text-xl)",
    fontWeight: 600,
    letterSpacing: "-0.015em",
    lineHeight: 1.2,
  },
});

const Handle = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-2)",
    minWidth: 0,
    fontSize: "var(--caps-text-md)",
    color: "var(--caps-text-2)",
  },
});

const handleButton = css({
  display: "inline-flex",
  alignItems: "baseline",
  padding: "1px 4px",
  margin: "0 -4px",
  border: "none",
  borderRadius: "var(--caps-radius-xs)",
  background: "transparent",
  color: "inherit",
  font: "inherit",
  cursor: "pointer",
  transition: "background-color var(--caps-dur-fast) var(--caps-ease)",

  "&:hover": {
    background: "var(--caps-hover)",
    color: "var(--caps-text)",
  },
});

const Dot = styled("span", {
  base: {
    color: "var(--caps-text-3)",
  },
});

const Presence = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-3)",
    minWidth: 0,
    fontSize: "var(--caps-text-sm)",
    color: "var(--caps-text-2)",
  },
});

const CustomStatus = styled("span", {
  base: {
    minWidth: 0,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    color: "var(--caps-text)",
  },
});

const PrimaryActions = styled("div", {
  base: {
    paddingBottom: "var(--caps-space-5)",

    "&:has(> div:empty)": {
      display: "none",
    },
  },
});

const Section = styled("section", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--caps-space-3)",
    paddingBlock: "var(--caps-space-5)",
    borderTop: "1px solid var(--caps-line-soft)",
  },
});

const SectionLabel = styled("h3", {
  base: {
    margin: 0,
    fontSize: "var(--caps-text-xs)",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--caps-text-3)",
  },
});

const Bio = styled("div", {
  base: {
    fontSize: "var(--caps-text-md)",
    lineHeight: 1.5,
    color: "var(--caps-text)",
    userSelect: "text",
    overflowWrap: "anywhere",

    // keep the popover compact; the full profile shows everything
    lineClamp: 4,
  },
});

const Chips = styled("div", {
  base: {
    display: "flex",
    flexWrap: "wrap",
    gap: "var(--caps-space-2)",
  },
});

const Chip = styled("button", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    maxWidth: "100%",
    height: "24px",
    padding: "0 8px",
    border: "none",
    borderRadius: "var(--caps-radius-sm)",
    background: "var(--caps-bg-raised)",
    boxShadow: "inset 0 0 0 1px var(--caps-line-soft)",
    color: "var(--caps-text)",
    font: "inherit",
    fontSize: "var(--caps-text-sm)",
    fontWeight: 500,
    cursor: "pointer",
    transition:
      "box-shadow var(--caps-dur-fast) var(--caps-ease), background-color var(--caps-dur-fast) var(--caps-ease)",

    "&:hover": {
      background: "var(--caps-active)",
      boxShadow: "inset 0 0 0 1px var(--caps-line-strong)",
    },
  },
});

const ChipDot = styled("span", {
  base: {
    flexShrink: 0,
    width: "8px",
    height: "8px",
    borderRadius: "50%",
  },
});

const ChipLabel = styled("span", {
  base: {
    minWidth: 0,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
});

const OwnerRow = styled("button", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-3)",
    width: "fit-content",
    padding: "2px 6px 2px 2px",
    margin: "0 -2px",
    border: "none",
    borderRadius: "var(--caps-radius-sm)",
    background: "transparent",
    color: "var(--caps-text)",
    font: "inherit",
    fontSize: "var(--caps-text-md)",
    fontWeight: 500,
    cursor: "pointer",

    "&:hover": {
      background: "var(--caps-hover)",
    },
  },
});

const Facts = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--caps-space-2)",
  },
});

const Fact = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-3)",
    minWidth: 0,
    fontSize: "var(--caps-text-md)",
    color: "var(--caps-text-2)",
  },
});

const FactIcon = styled("span", {
  base: {
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    width: "16px",
    height: "16px",
    borderRadius: "4px",
    color: "var(--caps-on-accent)",
    background: "var(--caps-accent)",

    "&:has(svg[viewBox='0 0 32 32'])": {
      background: "transparent",
    },
  },
});

const FactServer = styled("span", {
  base: {
    minWidth: 0,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
});

const FactValue = styled("span", {
  base: {
    marginLeft: "auto",
    flexShrink: 0,
    color: "var(--caps-text)",
    fontVariantNumeric: "tabular-nums",
  },
});

const FullProfile = styled("button", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--caps-space-2)",
    height: "var(--caps-h-md)",
    marginTop: "var(--caps-space-2)",
    border: "none",
    borderRadius: "var(--caps-radius-md)",
    background: "transparent",
    color: "var(--caps-text-2)",
    font: "inherit",
    fontSize: "var(--caps-text-md)",
    fontWeight: 500,
    cursor: "pointer",
    transition:
      "background-color var(--caps-dur-fast) var(--caps-ease), color var(--caps-dur-fast) var(--caps-ease)",

    "& svg": {
      transition: "transform var(--caps-dur) var(--caps-ease-out)",
    },

    "&:hover": {
      background: "var(--caps-hover)",
      color: "var(--caps-text)",
    },

    "&:hover svg": {
      transform: "translateX(2px)",
    },
  },
});
