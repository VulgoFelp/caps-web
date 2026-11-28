import { For, Match, Show, Switch, createSignal } from "solid-js";

import { useQuery, useQueryClient } from "@tanstack/solid-query";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import IconCopy from "lucide-solid/icons/copy";
import IconX from "lucide-solid/icons/x";

import { StaffRole, StaffUser, formatDate, tagOf, useStaffApi } from "./api";
import { heading } from "./Overview";
import {
  ConfirmDialog,
  ErrorText,
  List,
  SearchInput,
  Segmented,
  Toolbar,
  UserIdentity,
  UserPills,
  action,
  muted,
  pill,
  row,
} from "./ui";

type Filter = "all" | "staff" | "banned" | "new" | "bots";

export function Users(props: {
  role: StaffRole;
  selfId: string;
  selected?: string;
  onSelect: (id?: string) => void;
}) {
  const api = useStaffApi();
  const [query, setQuery] = createSignal("");
  const [filter, setFilter] = createSignal<Filter>("all");
  const [page, setPage] = createSignal(0);

  let timer: ReturnType<typeof setTimeout>;
  const [debounced, setDebounced] = createSignal("");

  const list = useQuery(() => ({
    queryKey: ["staff", "users", debounced(), filter(), page()],
    queryFn: () =>
      api.get<{ users: StaffUser[]; total: number; pageSize: number }>(
        `/users?q=${encodeURIComponent(debounced())}&filter=${filter()}&page=${page()}`,
      ),
  }));

  return (
    <Split>
      <Main>
        <Toolbar>
          <SearchInput
            placeholder="Buscar por nome, nome#1234 ou ID"
            value={query()}
            onInput={(e) => {
              setQuery(e.currentTarget.value);
              clearTimeout(timer);
              timer = setTimeout(() => {
                setPage(0);
                setDebounced(query().trim());
              }, 250);
            }}
            aria-label="Buscar usuários"
          />
          <Segmented<Filter>
            label="Filtro"
            value={filter()}
            onChange={(v) => {
              setFilter(v);
              setPage(0);
            }}
            options={[
              { value: "all", label: "Todos" },
              { value: "staff", label: "Equipe" },
              { value: "banned", label: "Banidos" },
              { value: "new", label: "Novos" },
              { value: "bots", label: "Bots" },
            ]}
          />
        </Toolbar>

        <Show when={list.error}>
          <ErrorText>{(list.error as Error).message}</ErrorText>
        </Show>

        <List>
          <For
            each={list.data?.users ?? []}
            fallback={
              <div class={row()}>
                <span class={muted}>
                  {list.isLoading ? "Carregando…" : "Nenhuma conta encontrada."}
                </span>
              </div>
            }
          >
            {(u) => (
              <button
                type="button"
                class={row({ interactive: true })}
                aria-selected={props.selected === u.id}
                onClick={() => props.onSelect(u.id)}
              >
                <UserIdentity user={u} />
                <span class={css({ flex: 1 })} />
                <UserPills user={u} />
                <span class={muted}>{formatDate(u.createdAt)}</span>
              </button>
            )}
          </For>
        </List>

        <Show when={(list.data?.total ?? 0) > (list.data?.pageSize ?? 50)}>
          <Toolbar>
            <span class={muted}>
              {list.data!.total.toLocaleString("pt-BR")} contas · página{" "}
              {page() + 1}
            </span>
            <span class={css({ flex: 1 })} />
            <button
              type="button"
              class={action()}
              disabled={page() === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </button>
            <button
              type="button"
              class={action()}
              disabled={(page() + 1) * list.data!.pageSize >= list.data!.total}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </button>
          </Toolbar>
        </Show>
      </Main>

      <Show when={props.selected}>
        <UserDetail
          id={props.selected!}
          role={props.role}
          selfId={props.selfId}
          onClose={() => props.onSelect(undefined)}
        />
      </Show>
    </Split>
  );
}

type Detail = {
  user: StaffUser;
  status: { text?: string; presence?: string } | null;
  accountDisabled: boolean;
  email: string | null;
  sessions: { id: string; name: string; lastSeen: string | null }[];
  ownedServers: { id: string; name: string }[];
  memberOf: number;
  reportsAgainst: number;
  reportsBy: number;
  history: {
    at: string;
    actorTag: string;
    action: string;
    details: Record<string, unknown>;
  }[];
};

export const ACTION_LABEL: Record<string, string> = {
  ban: "Baniu",
  unban: "Desbaniu",
  logout: "Encerrou as sessões de",
  role: "Mudou o cargo de",
  "report.resolve": "Resolveu a denúncia",
  "report.reject": "Rejeitou a denúncia",
  "report.reopen": "Reabriu a denúncia",
  "server.delete": "Excluiu a comunidade",
};

function UserDetail(props: {
  id: string;
  role: StaffRole;
  selfId: string;
  onClose: () => void;
}) {
  const api = useStaffApi();
  const queryClient = useQueryClient();
  const [dialog, setDialog] = createSignal<
    "ban" | "unban" | "logout" | StaffRole | "none"
  >();
  const [copied, setCopied] = createSignal(false);

  const q = useQuery(() => ({
    queryKey: ["staff", "user", props.id],
    queryFn: () => api.get<Detail>(`/users/${props.id}`),
  }));

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["staff"] });
  };

  const isSelf = () => props.id === props.selfId;
  const u = () => q.data?.user;

  return (
    <Panel aria-label="Detalhes da conta">
      <PanelHead>
        <span>Conta</span>
        <button
          type="button"
          class={iconButton}
          aria-label="Fechar"
          onClick={props.onClose}
        >
          <IconX size={16} />
        </button>
      </PanelHead>

      <Switch>
        <Match when={q.error}>
          <ErrorText>{(q.error as Error).message}</ErrorText>
        </Match>
        <Match when={u()}>
          <PanelBody>
            <UserIdentity user={u()!} size={48} />
            <div class={pills}>
              <UserPills user={u()!} />
              <Show when={q.data!.accountDisabled && !u()!.banned}>
                <span class={pill({ tone: "warning" })}>Login bloqueado</span>
              </Show>
            </div>

            <dl class={facts}>
              <dt>ID</dt>
              <dd>
                <button
                  type="button"
                  class={copy}
                  onClick={() => {
                    navigator.clipboard.writeText(u()!.id);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1200);
                  }}
                >
                  {u()!.id}
                  <IconCopy size={12} />
                  <Show when={copied()}>
                    <span class={pill({ tone: "success" })}>Copiado</span>
                  </Show>
                </button>
              </dd>
              <Show when={q.data!.email}>
                <dt>E-mail</dt>
                <dd>{q.data!.email}</dd>
              </Show>
              <dt>Criada em</dt>
              <dd>{formatDate(u()!.createdAt, true)}</dd>
              <Show when={q.data!.status?.text}>
                <dt>Status</dt>
                <dd>{q.data!.status!.text}</dd>
              </Show>
              <dt>Comunidades</dt>
              <dd>
                membro de {q.data!.memberOf} · dono de{" "}
                {q.data!.ownedServers.length}
                <Show when={q.data!.ownedServers.length}>
                  {" "}
                  ({q.data!.ownedServers.map((s) => s.name).join(", ")})
                </Show>
              </dd>
              <dt>Sessões ativas</dt>
              <dd>{q.data!.sessions.length}</dd>
              <dt>Denúncias</dt>
              <dd>
                {q.data!.reportsAgainst} contra · {q.data!.reportsBy} feitas
              </dd>
            </dl>

            <h3 class={heading}>Moderação</h3>
            <div class={actions}>
              <Show
                when={u()!.banned}
                fallback={
                  <button
                    type="button"
                    class={action({ tone: "danger" })}
                    disabled={isSelf() || !!u()!.role}
                    title={
                      u()!.role ? "Remova da equipe antes de banir" : undefined
                    }
                    onClick={() => setDialog("ban")}
                  >
                    Banir da plataforma
                  </button>
                }
              >
                <button
                  type="button"
                  class={action({ tone: "primary" })}
                  onClick={() => setDialog("unban")}
                >
                  Desbanir
                </button>
              </Show>
              <button
                type="button"
                class={action()}
                disabled={
                  !q.data!.sessions.length ||
                  (!!u()!.role && props.role !== "admin" && !isSelf())
                }
                onClick={() => setDialog("logout")}
              >
                Encerrar sessões
              </button>
            </div>

            <Show when={props.role === "admin" && !isSelf() && !u()!.bot}>
              <h3 class={heading}>Equipe do CAPS</h3>
              <div class={actions}>
                <button
                  type="button"
                  class={action()}
                  disabled={u()!.role === "admin" || u()!.banned}
                  onClick={() => setDialog("admin")}
                >
                  Tornar Administrador
                </button>
                <button
                  type="button"
                  class={action()}
                  disabled={u()!.role === "mod" || u()!.banned}
                  onClick={() => setDialog("mod")}
                >
                  Tornar Moderador
                </button>
                <Show when={u()!.role}>
                  <button
                    type="button"
                    class={action({ tone: "danger" })}
                    onClick={() => setDialog("none")}
                  >
                    Remover da equipe
                  </button>
                </Show>
              </div>
            </Show>

            <Show when={q.data!.history.length}>
              <h3 class={heading}>Histórico</h3>
              <ul class={history}>
                <For each={q.data!.history}>
                  {(h) => (
                    <li>
                      <strong>{h.actorTag}</strong>{" "}
                      {ACTION_LABEL[h.action] ?? h.action}
                      <Show when={h.details?.reason}>
                        {" "}
                        — “{String(h.details.reason)}”
                      </Show>
                      <span class={muted}> · {formatDate(h.at, true)}</span>
                    </li>
                  )}
                </For>
              </ul>
            </Show>
          </PanelBody>

          <ConfirmDialog
            open={dialog() === "ban"}
            title={`Banir ${tagOf(u()!)}?`}
            description="A conta perde o acesso na hora: todas as sessões são encerradas e o login fica bloqueado até alguém desbanir."
            confirmLabel="Banir"
            danger
            input={{
              label: "Motivo (fica no registro)",
              placeholder: "Ex.: spam repetido",
              multiline: true,
            }}
            onConfirm={(reason) =>
              api.post(`/users/${props.id}/ban`, { reason }).then(refresh)
            }
            onClose={() => setDialog(undefined)}
          />
          <ConfirmDialog
            open={dialog() === "unban"}
            title={`Desbanir ${tagOf(u()!)}?`}
            description="O login volta a funcionar normalmente."
            confirmLabel="Desbanir"
            onConfirm={() => api.post(`/users/${props.id}/unban`).then(refresh)}
            onClose={() => setDialog(undefined)}
          />
          <ConfirmDialog
            open={dialog() === "logout"}
            title="Encerrar todas as sessões?"
            description="A pessoa sai de todos os dispositivos e precisa entrar de novo."
            confirmLabel="Encerrar sessões"
            onConfirm={() =>
              api.post(`/users/${props.id}/logout`).then(refresh)
            }
            onClose={() => setDialog(undefined)}
          />
          <ConfirmDialog
            open={
              dialog() === "admin" || dialog() === "mod" || dialog() === "none"
            }
            title={
              dialog() === "none"
                ? `Remover ${tagOf(u()!)} da equipe?`
                : `Tornar ${tagOf(u()!)} ${dialog() === "admin" ? "Administrador" : "Moderador"}?`
            }
            description={
              dialog() === "none"
                ? "A pessoa perde o badge e os poderes da equipe (incluindo esta página)."
                : dialog() === "admin"
                  ? "Administradores moderam, agem como dono em qualquer comunidade e gerenciam a equipe."
                  : "Moderadores moderam e agem como dono em qualquer comunidade, mas não mexem na equipe."
            }
            confirmLabel="Confirmar"
            danger={dialog() === "none"}
            onConfirm={() =>
              api
                .post(`/users/${props.id}/role`, { role: dialog() })
                .then(refresh)
            }
            onClose={() => setDialog(undefined)}
          />
        </Match>
        <Match when>
          <PanelBody>
            <span class={muted}>Carregando…</span>
          </PanelBody>
        </Match>
      </Switch>
    </Panel>
  );
}

const Split = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: "var(--caps-space-7)",
    alignItems: "start",
    "@media (max-width: 1000px)": { gridTemplateColumns: "minmax(0, 1fr)" },
  },
});

const Main = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--caps-space-5)",
    minWidth: 0,
  },
});

export const Panel = styled("aside", {
  base: {
    position: "sticky",
    top: 0,
    width: "380px",
    maxWidth: "100%",
    borderRadius: "var(--caps-radius-lg)",
    background: "var(--caps-bg-surface)",
    boxShadow: "inset 0 0 0 1px var(--caps-line-soft)",
    animation: "authHintIn 160ms var(--caps-ease-out)",
    "@media (max-width: 1000px)": { position: "static", width: "100%" },
  },
});

export const PanelHead = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    height: "44px",
    paddingInline: "var(--caps-space-6) var(--caps-space-4)",
    borderBottom: "1px solid var(--caps-line-soft)",
    fontWeight: 600,
    "& > span": { flex: 1 },
  },
});

export const PanelBody = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--caps-space-5)",
    padding: "var(--caps-space-6)",
  },
});

export const iconButton = css({
  all: "unset",
  display: "grid",
  placeItems: "center",
  width: "28px",
  height: "28px",
  borderRadius: "var(--caps-radius-sm)",
  color: "var(--caps-text-3)",
  cursor: "pointer",
  "&:hover": { background: "var(--caps-hover)", color: "var(--caps-text)" },
  "&:focus-visible": { boxShadow: "var(--caps-focus-ring)" },
});

const pills = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--caps-space-2)",
});

const facts = css({
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr)",
  gap: "var(--caps-space-3) var(--caps-space-6)",
  margin: 0,
  fontSize: "var(--caps-text-md)",
  "& dt": { color: "var(--caps-text-3)" },
  "& dd": { margin: 0, color: "var(--caps-text)", overflowWrap: "anywhere" },
});

const copy = css({
  all: "unset",
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--caps-space-3)",
  fontFamily: "var(--caps-font-mono)",
  fontSize: "var(--caps-text-sm)",
  cursor: "pointer",
  "&:hover": { color: "var(--caps-accent-text)" },
});

const actions = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--caps-space-3)",
});

const history = css({
  display: "flex",
  flexDirection: "column",
  gap: "var(--caps-space-3)",
  margin: 0,
  padding: 0,
  listStyle: "none",
  fontSize: "var(--caps-text-md)",
  color: "var(--caps-text-2)",
  "& strong": { color: "var(--caps-text)", fontWeight: 600 },
});
