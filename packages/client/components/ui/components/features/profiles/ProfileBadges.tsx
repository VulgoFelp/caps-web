import BiSolidShield from "lucide-solid/icons/shield";
import { Show } from "solid-js";

import { Trans, useLingui } from "@lingui/solid/macro";
import { User, UserBadges } from "stoat.js";
import { styled } from "styled-system/jsx";

import badgeJoke1 from "../../../../../public/assets/badges/amog.svg";
import badgeJoke2 from "../../../../../public/assets/badges/amorbus.svg";
import badgeEarlyAdopter from "../../../../../public/assets/badges/early_adopter.svg";
import badgePaw from "../../../../../public/assets/badges/paw.svg";
import badgeRaccoon from "../../../../../public/assets/badges/raccoon.svg";
import { Text } from "../../design";

import { ProfileCard } from "./ProfileCard";
import { StaffBadge, staffRole } from "./StaffBadge";

/**
 * Badges still shown on CAPS (upstream Stoat staff/supporter badges are hidden,
 * CAPS staff badges are rendered by <StaffBadge />)
 */
const VISIBLE_UPSTREAM_BADGES =
  UserBadges.EarlyAdopter |
  UserBadges.ResponsibleDisclosure |
  UserBadges.ReservedRelevantJokeBadge1 |
  UserBadges.ReservedRelevantJokeBadge2 |
  UserBadges.Paw;

export function ProfileBadges(props: { user: User; bare?: boolean }) {
  const { t } = useLingui();

  const row = () => (
    <BadgeRow>
      <StaffBadge badges={props.user.badges} size="lg" />
      <Show when={props.user.badges & UserBadges.EarlyAdopter}>
        <img
          use:floating={{
            tooltip: {
              placement: "top",
              content: t`One of the first 1000 users!`,
            },
          }}
          src={badgeEarlyAdopter}
        />
      </Show>
      <Show when={props.user.badges & UserBadges.ResponsibleDisclosure}>
        <span
          use:floating={{
            tooltip: {
              placement: "top",
              content: t`Responsibly disclosed security issues`,
            },
          }}
        >
          <BiSolidShield />
        </span>
      </Show>
      <Show when={props.user.badges & UserBadges.ReservedRelevantJokeBadge1}>
        <img
          use:floating={{
            tooltip: {
              placement: "top",
              content: t`irrelevant joke badge 1`,
            },
          }}
          src={badgeJoke1}
        />
      </Show>
      <Show when={props.user.badges & UserBadges.ReservedRelevantJokeBadge1}>
        <img
          use:floating={{
            tooltip: {
              placement: "top",
              content: t`irrelevant joke badge 2`,
            },
          }}
          src={badgeJoke2}
        />
      </Show>
      <Show when={props.user.badges & UserBadges.Paw}>
        <img
          use:floating={{
            tooltip: {
              placement: "top",
              content: "🦊",
            },
          }}
          src={badgePaw}
        />
      </Show>
      <Show when={props.user.id === "01EX2NCWQ0CHS3QJF0FEQS1GR4"}>
        <img
          use:floating={{
            tooltip: {
              placement: "top",
              content: "🦝",
            },
          }}
          src={badgeRaccoon}
        />
      </Show>
    </BadgeRow>
  );

  return (
    <Show
      when={
        staffRole(props.user.badges) ||
        props.user.badges & VISIBLE_UPSTREAM_BADGES
      }
    >
      <Show when={!props.bare} fallback={row()}>
        <ProfileCard>
          <Text class="title" size="large">
            <Trans>Badges</Trans>
          </Text>

          {row()}
        </ProfileCard>
      </Show>
    </Show>
  );
}

const BadgeRow = styled("div", {
  base: {
    gap: "var(--caps-space-4)",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",

    "& > img, & > span > img, & > span > svg": {
      width: "24px",
      height: "24px",
      aspectRatio: "1/1",
    },
  },
});
