import { For, Show } from "solid-js";

import { useQuery } from "@tanstack/solid-query";
import { css } from "styled-system/css";

import { formatDate, useStaffApi } from "./api";
import { Empty } from "./Reports";
import { ErrorText, List, muted, row } from "./ui";
import { ACTION_LABEL } from "./Users";

type Entry = {
  id: string;
  at: string;
  actor: {
    username: string;
    discriminator?: string;
    displayName?: string | null;
  };
  action: string;
  target: string;
  details: Record<string, unknown>;
};

const ROLE: Record<string, string> = {
  admin: "Administrador",
  mod: "Moderador",
};

function describe(e: Entry) {
  const d = e.details ?? {};
  const who = (d.tag as string) ?? (d.name as string) ?? e.target;
  switch (e.action) {
    case "role":
      return `${who}: ${d.from ? ROLE[d.from as string] : "sem cargo"} → ${d.to ? ROLE[d.to as string] : "sem cargo"}`;
    case "server.delete":
      return `${who} (${d.messages ?? 0} mensagens, ${d.members ?? 0} membros)`;
    case "report.resolve":
    case "report.reject":
    case "report.reopen":
      return `${d.type ?? ""} ${d.targetId ?? ""}`.trim();
    default:
      return who;
  }
}

export function Audit() {
  const api = useStaffApi();
  const q = useQuery(() => ({
    queryKey: ["staff", "audit"],
    queryFn: () => api.get<{ entries: Entry[] }>("/audit"),
  }));

  return (
    <div
      class={css({
        display: "flex",
        flexDirection: "column",
        gap: "var(--caps-space-5)",
        maxWidth: "880px",
      })}
    >
      <Show when={q.error}>
        <ErrorText>{(q.error as Error).message}</ErrorText>
      </Show>
      <Show
        when={q.data?.entries.length}
        fallback={
          <Empty>
            {q.isLoading ? "Carregando…" : "Nenhuma ação registrada ainda."}
          </Empty>
        }
      >
        <List>
          <For each={q.data!.entries}>
            {(e) => (
              <div class={row()}>
                <span class={text}>
                  <strong>{e.actor.displayName ?? e.actor.username}</strong>{" "}
                  {ACTION_LABEL[e.action] ?? e.action}{" "}
                  <span class={target}>{describe(e)}</span>
                  <Show when={e.details?.reason || e.details?.notes}>
                    <span class={note}>
                      “{String(e.details.reason || e.details.notes)}”
                    </span>
                  </Show>
                </span>
                <span class={muted}>{formatDate(e.at, true)}</span>
              </div>
            )}
          </For>
        </List>
      </Show>
    </div>
  );
}

const text = css({
  flex: 1,
  minWidth: 0,
  fontSize: "var(--caps-text-md)",
  color: "var(--caps-text-2)",
  "& strong": { color: "var(--caps-text)", fontWeight: 600 },
});
const target = css({ color: "var(--caps-text)" });
const note = css({
  display: "block",
  marginTop: "2px",
  color: "var(--caps-text-3)",
});
