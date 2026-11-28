import { Match, Show, Switch, createSignal } from "solid-js";

import { useQuery } from "@tanstack/solid-query";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { useUser } from "@revolt/client";
import { EmptyState, Header, iconSize } from "@revolt/ui";
import { staffRole } from "@revolt/ui/components/features/profiles/StaffBadge";

import IconShield from "lucide-solid/icons/shield";

import { HeaderIcon } from "../common/CommonHeader";

import { Audit } from "./Audit";
import { Communities } from "./Communities";
import { Overview } from "./Overview";
import { Reports } from "./Reports";
import { Users } from "./Users";
import { useStaffApi } from "./api";
import { Segmented, pill } from "./ui";

type Tab = "overview" | "users" | "reports" | "communities" | "audit";

/**
 * Staff page: platform moderation and management for CAPS staff
 * (replaces the shell scripts on the server)
 */
export function StaffPage() {
  const user = useUser();
  const api = useStaffApi();
  const role = () => staffRole(user()?.badges);

  const [tab, setTab] = createSignal<Tab>("overview");
  const [selectedUser, setSelectedUser] = createSignal<string>();

  const openReports = useQuery(() => ({
    queryKey: ["staff", "overview"],
    enabled: !!role(),
    queryFn: () => api.get<{ counts: { openReports: number } }>("/overview"),
  }));

  function openUser(id: string) {
    setSelectedUser(id);
    setTab("users");
  }

  return (
    <Base>
      <Header placement="primary">
        <HeaderIcon>
          <IconShield {...iconSize(18)} />
        </HeaderIcon>
        Equipe do CAPS
        <Show when={role()}>
          <span class={pill({ tone: "accent" })}>
            {role() === "admin" ? "Administrador" : "Moderador"}
          </span>
        </Show>
      </Header>
      <Show
        when={role()}
        fallback={
          <div class={css({ flex: 1, display: "grid", placeItems: "center" })}>
            <EmptyState
              icon={<IconShield size={22} />}
              title="Área restrita"
              description="Esta página é só para Administradores e Moderadores do CAPS."
            />
          </div>
        }
      >
        <div use:scrollable={{ class: scroller }}>
          <Page>
            <Segmented<Tab>
              label="Seções da equipe"
              value={tab()}
              onChange={setTab}
              options={[
                { value: "overview", label: "Visão geral" },
                { value: "users", label: "Usuários" },
                {
                  value: "reports",
                  label: "Denúncias",
                  count: openReports.data?.counts.openReports,
                },
                { value: "communities", label: "Comunidades" },
                { value: "audit", label: "Registro" },
              ]}
            />
            <Switch>
              <Match when={tab() === "overview"}>
                <Overview
                  openUser={openUser}
                  goReports={() => setTab("reports")}
                />
              </Match>
              <Match when={tab() === "users"}>
                <Users
                  role={role()!}
                  selfId={user()!.id}
                  selected={selectedUser()}
                  onSelect={setSelectedUser}
                />
              </Match>
              <Match when={tab() === "reports"}>
                <Reports openUser={openUser} />
              </Match>
              <Match when={tab() === "communities"}>
                <Communities />
              </Match>
              <Match when={tab() === "audit"}>
                <Audit />
              </Match>
            </Switch>
          </Page>
        </div>
      </Show>
    </Base>
  );
}

const Base = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },
});

const scroller = css({ flex: 1, minHeight: 0 });

const Page = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--caps-space-8)",
    width: "100%",
    maxWidth: "1240px",
    marginInline: "auto",
    padding: "var(--caps-space-8) var(--caps-space-9) var(--caps-space-10)",
    _tablet: { padding: "var(--caps-space-7) var(--caps-space-6)" },
    _phone: { padding: "var(--caps-space-6) var(--caps-space-4)" },
  },
});
