import { For, Show, createSignal } from "solid-js";

import { useQuery, useQueryClient } from "@tanstack/solid-query";
import { css } from "styled-system/css";

import { useNavigate } from "@revolt/routing";
import { Avatar } from "@revolt/ui";

import { StaffUser, formatDate, tagOf, useStaffApi } from "./api";
import {
  ConfirmDialog,
  ErrorText,
  List,
  SearchInput,
  Toolbar,
  action,
  muted,
  row,
} from "./ui";

type ServerRow = {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  owner: StaffUser | null;
  members: number;
  channels: number;
  createdAt: string;
};

export function Communities() {
  const api = useStaffApi();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [query, setQuery] = createSignal("");
  const [debounced, setDebounced] = createSignal("");
  const [toDelete, setToDelete] = createSignal<ServerRow>();
  let timer: ReturnType<typeof setTimeout>;

  const q = useQuery(() => ({
    queryKey: ["staff", "servers", debounced()],
    queryFn: () =>
      api.get<{ servers: ServerRow[] }>(
        `/servers?q=${encodeURIComponent(debounced())}`,
      ),
  }));

  return (
    <div
      class={css({
        display: "flex",
        flexDirection: "column",
        gap: "var(--caps-space-5)",
      })}
    >
      <Toolbar>
        <SearchInput
          placeholder="Buscar comunidade por nome ou ID"
          value={query()}
          aria-label="Buscar comunidades"
          onInput={(e) => {
            setQuery(e.currentTarget.value);
            clearTimeout(timer);
            timer = setTimeout(() => setDebounced(query().trim()), 250);
          }}
        />
      </Toolbar>
      <Show when={q.error}>
        <ErrorText>{(q.error as Error).message}</ErrorText>
      </Show>
      <List>
        <For
          each={q.data?.servers ?? []}
          fallback={
            <div class={row()}>
              <span class={muted}>
                {q.isLoading ? "Carregando…" : "Nenhuma comunidade encontrada."}
              </span>
            </div>
          }
        >
          {(s) => (
            <div class={row()}>
              <Avatar
                size={36}
                shape="rounded-square"
                src={api.media("icons", s.icon)}
                fallback={s.name}
              />
              <span class={info}>
                <span class={name}>{s.name}</span>
                <span class={muted}>
                  {s.owner ? `Dono: ${tagOf(s.owner)}` : "Sem dono"} ·{" "}
                  {s.members} membros · {s.channels} canais · criada em{" "}
                  {formatDate(s.createdAt)}
                </span>
              </span>
              <button
                type="button"
                class={action()}
                onClick={() => navigate(`/server/${s.id}`)}
              >
                Abrir
              </button>
              <button
                type="button"
                class={action({ tone: "danger" })}
                onClick={() => setToDelete(s)}
              >
                Excluir
              </button>
            </div>
          )}
        </For>
      </List>

      <ConfirmDialog
        open={!!toDelete()}
        title={`Excluir “${toDelete()?.name}”?`}
        description="Apaga a comunidade inteira: canais, mensagens, membros, convites e banimentos. Não dá para desfazer."
        confirmLabel="Excluir comunidade"
        danger
        input={{
          label: "Digite o nome da comunidade para confirmar",
          placeholder: toDelete()?.name,
          mustEqual: toDelete()?.name,
        }}
        onConfirm={(confirm) =>
          api
            .del(`/servers/${toDelete()!.id}`, { confirm })
            .then(() => queryClient.invalidateQueries({ queryKey: ["staff"] }))
        }
        onClose={() => setToDelete(undefined)}
      />
    </div>
  );
}

const info = css({
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: "2px",
});
const name = css({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: "var(--caps-text-base)",
  fontWeight: 600,
});
