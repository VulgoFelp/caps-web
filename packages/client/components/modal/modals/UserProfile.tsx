import { lazy } from "solid-js";

import { Dialog, DialogProps } from "@revolt/ui";

import { Modals } from "../types";

// loaded lazily: the card itself opens modals, so a static import would be circular
const UserCard = lazy(() =>
  import("@revolt/ui/components/floating/UserCard").then((m) => ({
    default: m.UserCard,
  })),
);

/**
 * Full user profile: the profile card in its complete form
 */
export function UserProfileModal(
  props: DialogProps & Modals & { type: "user_profile" },
) {
  return (
    <Dialog
      show={props.show}
      onClose={props.onClose}
      minWidth={520}
      padding={0}
    >
      <UserCard
        user={props.user}
        member={props.member}
        onClose={props.onClose}
        full
      />
    </Dialog>
  );
}
