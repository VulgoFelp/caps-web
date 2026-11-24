import { Trans } from "@lingui/solid/macro";
import { styled } from "styled-system/jsx";

import { useClient } from "@revolt/client";
import { useModals } from "@revolt/modal";
import { Button, EmptyState, Header, iconSize } from "@revolt/ui";

import IconMessages from "lucide-solid/icons/messages-square";

import { HeaderIcon } from "./common/CommonHeader";

/**
 * Conversations section landing (no conversation open yet)
 */
export function ConversationsPage() {
  const client = useClient();
  const { openModal } = useModals();

  return (
    <Base>
      <Header placement="primary">
        <HeaderIcon>
          <IconMessages {...iconSize(18)} />
        </HeaderIcon>
        <Trans>Conversations</Trans>
      </Header>
      <Body>
        <EmptyState
          icon={<IconMessages size={22} />}
          title={<Trans>Pick a conversation</Trans>}
          description={
            <Trans>
              Your direct messages and groups are in the sidebar. Start a new
              one with a friend or create a group for your squad.
            </Trans>
          }
          actions={
            <>
              <Button
                variant="tonal"
                onPress={() =>
                  openModal({ type: "add_friend", client: client() })
                }
              >
                <Trans>Add friend</Trans>
              </Button>
              <Button
                onPress={() =>
                  openModal({ type: "create_group", client: client() })
                }
              >
                <Trans>New group</Trans>
              </Button>
            </>
          }
        />
      </Body>
    </Base>
  );
}

const Base = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minWidth: 0,
  },
});

const Body = styled("div", {
  base: {
    flex: 1,
    display: "grid",
    placeItems: "center",
  },
});
