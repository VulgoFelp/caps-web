import { For, Match, Show, Switch, createSignal } from "solid-js";

import { useQuery, useQueryClient } from "@tanstack/solid-query";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { useNavigate } from "@revolt/routing";

import { StaffUser, formatDate, tagOf, useStaffApi } from "./api";
import {
  ConfirmDialog,
  ErrorText,
  Segmented,
  UserIdentity,
  action,
  muted,
  pill,
} from "./ui";

type Status = "Created" | "Resolved" | "Rejected";

type Report = {
  id: string;
  createdAt: string;
  author: StaffUser | null;
  type: "Message" | "Server" | "User";
  reason: string;
  targetId: string;
  context: string;
  status: Status;
  rejectionReason: string | null;
  closedAt: string | null;
  notes: string;
  target: {
    missing?: boolean;
    content?: string;
    attachments?: number;
    author?: StaffUser | null;
    user?: StaffUser;
    name?: string;
    description?: string;
    owner?: StaffUser | null;
    path?: string;
  };
};

const REASON: Record<string, string> = {
  NoneSpecified: "Sem motivo informado",
  Illegal: "Conteúdo ilegal",
  IllegalGoods: "Venda de itens ilegais",
  IllegalExtortion: "Extorsão",
  IllegalPornography: "Pornografia ilegal",
  IllegalHacking: "Invasão / hacking",
  ExtremeViolence: "Violência extrema",
  PromotesHarm: "Incentivo a dano",
  UnsolicitedSpam: "Spam não solicitado",
  Raid: "Raid",
  SpamAbuse: "Spam / abuso",
  ScamsFraud: "Golpe / fraude",
  Malware: "Malware",
  Harassment: "Assédio",
  InappropriateProfile: "Perfil inadequado",
  Impersonation: "Se passando por outra pessoa",
  BanEvasion: "Evasão de banimento",
  Underage: "Menor de idade",
};

const TYPE: Record<string, string> = {
  Message: "Mensagem",
  Server: "Comunidade",
  User: "Usuário",
};

export function Reports(props: { openUser: (id: string) => void }) {
  const api = useStaffApi();
  const [status, setStatus] = createSignal<Status>("Created");

  const q = useQuery(() => ({
    queryKey: ["staff", "reports", status()],
    queryFn: () =>
      api.get<{ reports: Report[] }>(`/reports?status=${status()}`),
    refetchInterval: 30_000,
  }));

  return (
    <Stack>
      <Segmented<Status>
        label="Situação"
        value={status()}
        onChange={setStatus}
        options={[
          { value: "Created", label: "Abertas" },
          { value: "Resolved", label: "Resolvidas" },
          { value: "Rejected", label: "Rejeitadas" },
        ]}
      />
      <Show when={q.error}>
        <ErrorText>{(q.error as Error).message}</ErrorText>
      </Show>
      <For
        each={q.data?.reports ?? []}
        fallback={
          <Empty>
            {q.isLoading
              ? "Carregando…"
              : status() === "Created"
                ? "Nenhuma denúncia aberta. Tudo em dia."
                : "Nada por aqui."}
          </Empty>
        }
      >
        {(r) => <ReportCard report={r} openUser={props.openUser} />}
      </For>
    </Stack>
  );
}

function ReportCard(props: { report: Report; openUser: (id: string) => void }) {
  const api = useStaffApi();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dialog, setDialog] = createSignal<"resolve" | "reject">();
  const r = () => props.report;
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["staff"] });

  const offender = () =>
    r().target.author ?? r().target.user ?? r().target.owner ?? undefined;

  return (
    <Card>
      <Head>
        <span class={pill({ tone: "warning" })}>
          {REASON[r().reason] ?? r().reason}
        </span>
        <span class={pill()}>{TYPE[r().type] ?? r().type}</span>
        <span class={css({ flex: 1 })} />
        <span class={muted}>{formatDate(r().createdAt, true)}</span>
      </Head>

      <Target>
        <Switch>
          <Match when={r().target.missing}>
            <span class={muted}>O conteúdo denunciado já foi apagado.</span>
          </Match>
          <Match when={r().type === "Message"}>
            <Show when={r().target.author}>
              <UserIdentity user={r().target.author!} size={24} />
            </Show>
            <blockquote class={quote}>
              {r().target.content || "(sem texto)"}
              <Show when={r().target.attachments}>
                <span class={muted}> · {r().target.attachments} anexo(s)</span>
              </Show>
            </blockquote>
          </Match>
          <Match when={r().type === "Server"}>
            <strong>{r().target.name}</strong>
            <Show when={r().target.description}>
              <span class={muted}>{r().target.description}</span>
            </Show>
            <Show when={r().target.owner}>
              <span class={muted}>Dono: {tagOf(r().target.owner!)}</span>
            </Show>
          </Match>
          <Match when={r().type === "User" && r().target.user}>
            <UserIdentity user={r().target.user!} />
          </Match>
        </Switch>
      </Target>

      <Show when={r().context}>
        <p class={contextText}>
          <span class={muted}>Contexto de quem denunciou: </span>
          {r().context}
        </p>
      </Show>
      <Show when={r().author}>
        <span class={muted}>Denunciado por {tagOf(r().author!)}</span>
      </Show>
      <Show when={r().status !== "Created"}>
        <p class={contextText}>
          <span class={muted}>
            {r().status === "Resolved" ? "Resolvida" : "Rejeitada"}
            {r().closedAt ? ` em ${formatDate(r().closedAt!, true)}` : ""}
            {r().rejectionReason ? ` · motivo: ${r().rejectionReason}` : ""}
          </span>
          <Show when={r().notes}>
            <br />
            Nota: {r().notes}
          </Show>
        </p>
      </Show>

      <Actions>
        <Show when={r().target.path}>
          <button
            type="button"
            class={action()}
            onClick={() => navigate(r().target.path!)}
          >
            Abrir no CAPS
          </button>
        </Show>
        <Show when={offender()}>
          <button
            type="button"
            class={action()}
            onClick={() => props.openUser(offender()!.id)}
          >
            Ver conta denunciada
          </button>
        </Show>
        <span class={css({ flex: 1 })} />
        <Show
          when={r().status === "Created"}
          fallback={
            <button
              type="button"
              class={action()}
              onClick={() =>
                api.post(`/reports/${r().id}/reopen`).then(refresh)
              }
            >
              Reabrir
            </button>
          }
        >
          <button
            type="button"
            class={action()}
            onClick={() => setDialog("reject")}
          >
            Rejeitar
          </button>
          <button
            type="button"
            class={action({ tone: "primary" })}
            onClick={() => setDialog("resolve")}
          >
            Resolver
          </button>
        </Show>
      </Actions>

      <ConfirmDialog
        open={dialog() === "resolve"}
        title="Resolver denúncia"
        description="Use quando a denúncia procede e você já tomou a ação necessária (ex.: banir a conta, apagar o conteúdo)."
        confirmLabel="Marcar como resolvida"
        input={{
          label: "Nota interna (opcional)",
          placeholder: "O que foi feito",
          multiline: true,
        }}
        onConfirm={(notes) =>
          api.post(`/reports/${r().id}/resolve`, { notes }).then(refresh)
        }
        onClose={() => setDialog(undefined)}
      />
      <ConfirmDialog
        open={dialog() === "reject"}
        title="Rejeitar denúncia"
        description="Use quando a denúncia não procede."
        confirmLabel="Rejeitar"
        input={{ label: "Motivo", placeholder: "Ex.: não viola as regras" }}
        onConfirm={(reason) =>
          api.post(`/reports/${r().id}/reject`, { reason }).then(refresh)
        }
        onClose={() => setDialog(undefined)}
      />
    </Card>
  );
}

const Stack = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--caps-space-5)",
    maxWidth: "880px",
  },
});

const Card = styled("article", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--caps-space-4)",
    padding: "var(--caps-space-6)",
    borderRadius: "var(--caps-radius-lg)",
    background: "var(--caps-bg-surface)",
    boxShadow: "inset 0 0 0 1px var(--caps-line-soft)",
  },
});

const Head = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--caps-space-3)",
    flexWrap: "wrap",
  },
});

const Target = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--caps-space-3)",
    padding: "var(--caps-space-5)",
    borderRadius: "var(--caps-radius-md)",
    background: "var(--caps-bg-canvas)",
  },
});

const quote = css({
  margin: 0,
  fontSize: "var(--caps-text-base)",
  lineHeight: 1.5,
  color: "var(--caps-text)",
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
});

const contextText = css({
  margin: 0,
  fontSize: "var(--caps-text-md)",
  color: "var(--caps-text-2)",
  lineHeight: 1.5,
});

const Actions = styled("div", {
  base: {
    display: "flex",
    flexWrap: "wrap",
    gap: "var(--caps-space-3)",
    marginTop: "var(--caps-space-2)",
  },
});

export const Empty = styled("div", {
  base: {
    padding: "var(--caps-space-9)",
    textAlign: "center",
    fontSize: "var(--caps-text-md)",
    color: "var(--caps-text-3)",
    borderRadius: "var(--caps-radius-lg)",
    border: "1px dashed var(--caps-line)",
  },
});
