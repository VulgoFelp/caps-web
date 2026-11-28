import { For, Show } from "solid-js";

import { useQuery } from "@tanstack/solid-query";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { StaffUser, formatDate, useStaffApi } from "./api";
import { ErrorText, List, UserIdentity, UserPills, muted, row } from "./ui";

type OverviewData = {
  counts: {
    users: number;
    newUsers: number;
    servers: number;
    messages: number;
    openReports: number;
    banned: number;
    staff: number;
  };
  recentUsers: StaffUser[];
};

export function Overview(props: {
  openUser: (id: string) => void;
  goReports: () => void;
}) {
  const api = useStaffApi();
  const q = useQuery(() => ({
    queryKey: ["staff", "overview"],
    queryFn: () => api.get<OverviewData>("/overview"),
    refetchInterval: 30_000,
  }));

  const n = (v?: number) => (v ?? 0).toLocaleString("pt-BR");

  return (
    <Stack>
      <Show when={q.error}>
        <ErrorText>{(q.error as Error).message}</ErrorText>
      </Show>
      <Stats>
        <Stat label="Contas" value={n(q.data?.counts.users)} />
        <Stat
          label="Novas nos últimos 7 dias"
          value={n(q.data?.counts.newUsers)}
        />
        <Stat label="Comunidades" value={n(q.data?.counts.servers)} />
        <Stat label="Mensagens" value={n(q.data?.counts.messages)} />
        <Stat
          label="Denúncias abertas"
          value={n(q.data?.counts.openReports)}
          tone={q.data?.counts.openReports ? "warning" : undefined}
          onClick={props.goReports}
        />
        <Stat label="Contas banidas" value={n(q.data?.counts.banned)} />
        <Stat label="Equipe" value={n(q.data?.counts.staff)} />
      </Stats>

      <section>
        <h3 class={heading}>Contas mais recentes</h3>
        <List>
          <For each={q.data?.recentUsers ?? []}>
            {(u) => (
              <button
                type="button"
                class={row({ interactive: true })}
                onClick={() => props.openUser(u.id)}
              >
                <UserIdentity user={u} />
                <span class={css({ flex: 1 })} />
                <UserPills user={u} />
                <span class={muted}>{formatDate(u.createdAt, true)}</span>
              </button>
            )}
          </For>
        </List>
      </section>
    </Stack>
  );
}

function Stat(props: {
  label: string;
  value: string;
  tone?: "warning";
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      class={stat}
      data-tone={props.tone}
      data-clickable={!!props.onClick || undefined}
      onClick={() => props.onClick?.()}
      tabIndex={props.onClick ? 0 : -1}
    >
      <span class={statValue}>{props.value}</span>
      <span class={statLabel}>{props.label}</span>
    </button>
  );
}

const Stack = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--caps-space-9)",
  },
});

const Stats = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
    gap: "var(--caps-space-4)",
  },
});

const stat = css({
  all: "unset",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  gap: "var(--caps-space-2)",
  padding: "var(--caps-space-6)",
  borderRadius: "var(--caps-radius-lg)",
  background: "var(--caps-bg-surface)",
  boxShadow: "inset 0 0 0 1px var(--caps-line-soft)",
  cursor: "default",
  '&[data-tone="warning"]': {
    boxShadow: "inset 0 0 0 1px var(--caps-mention)",
  },
  "&[data-clickable]": { cursor: "pointer" },
  "&[data-clickable]:hover": { background: "var(--caps-bg-component)" },
  "&:focus-visible": { boxShadow: "var(--caps-focus-ring)" },
});

const statValue = css({
  fontSize: "var(--caps-text-3xl)",
  fontWeight: 650,
  letterSpacing: "-0.02em",
  fontVariantNumeric: "tabular-nums",
  color: "var(--caps-text)",
});

const statLabel = css({
  fontSize: "var(--caps-text-sm)",
  color: "var(--caps-text-3)",
});

export const heading = css({
  margin: "0 0 var(--caps-space-4)",
  fontSize: "var(--caps-text-sm)",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--caps-text-3)",
});
