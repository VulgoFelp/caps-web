# CAPS design system 2.0: "Grafite e lima"

O CAPS é um espaço social para quem joga junto. A interface é escura, compacta e
calma. Neutros grafite carregam quase tudo e um único acento lima marca o que
importa: ação principal, seleção e foco. Sem roxo saturado, gradientes
decorativos, glassmorphism ou cantos em pílula nos containers.

Fontes da verdade:
- `themes/capsTheme.ts`: cores, escalas e camadas;
- `caps-components.css`: os poucos componentes MDUI que restam;
- `styles.css`: base, foco, ícones e movimento reduzido.

Os tokens viram variáveis CSS `--caps-*` no `body`.

## Marca

- Símbolo: um "C" de tecla (cantos de keycap) com a luz do Caps Lock acesa. Fica em
  `design/CapsMark.tsx` (o "C" segue `currentColor` e a luz usa o acento) e é gerado por
  `branding/build_identity.py`.
- Wordmark: "CAPS" em Geist 680, tracking levemente negativo.
- Voz: direta, natural e sem gírias forçadas. Frases curtas no imperativo
  ("Escolha uma conversa", "Entrar na voz"). Sem slogans no produto.

## Arquitetura de superfícies

```
canvas (#0C0C0B)   barra superior, sidebar, margens
 └ painel (#191918)       conteúdo principal, flutua no canvas (raio lg + linha de 1px)
    └ superfície (#1D1D1B)  blocos dentro do painel: composer, cartões, listas
       └ componente (#282825)  controles: inputs, botões tonais, chips
overlay (#1C1C1A)  popovers, menus, palette, modais
```

| Token | Uso |
| --- | --- |
| `--caps-bg-canvas` / `-panel` / `-surface` / `-component` | os quatro degraus acima |
| `--caps-bg-overlay` | camadas flutuantes |
| `--caps-hover`, `--caps-active`, `--caps-selected` | véus neutros sobre qualquer superfície |
| `--caps-line-soft`, `--caps-line`, `--caps-line-strong` | divisórias e contornos de 1px |
| `--caps-text`, `-2`, `-3`, `-disabled` | primário (#ECEBE4), secundário, metadado, desabilitado |
| `--caps-accent`, `-hover`, `-soft`, `-line`, `-text`, `--caps-on-accent` | lima (#D4F24A) |
| `--caps-mention`, `-soft` | âmbar: menções e contadores de atenção |
| `--caps-danger`, `--caps-success`, `--caps-warning`, `--caps-info` (+ `-soft`) | estados |
| `--caps-presence-*` | online, ausente, foco, ocupado, offline |

Os aliases antigos (`--caps-bg-rail`, `-sidebar`, `-app`, `-raised`) apontam para o modelo novo.
As cores Material (`--md-sys-color-*`) não devem ser usadas em componentes.

Regras:
- No máximo **uma** ação com acento por área. O resto é tonal, contorno ou texto.
- Profundidade vem de degraus de superfície e linhas de 1px. Sombras só em camadas
  flutuantes (`--caps-shadow-pop`, `--caps-shadow-modal`).
- Nada de cartão dentro de cartão. Dentro de uma superfície, separe com linha fina.

## Escalas

- Espaçamento `--caps-space-1…10`: 2, 4, 6, 8, 12, 16, 20, 24, 32, 48 px.
- Raios `--caps-radius-*`: xs 4, sm 6, md 8, lg 10, xl 14, full. Containers ficam até 14px.
  Só avatares, pontos de status e selos são redondos.
- Alturas de controle `--caps-h-*`: xs 24, sm 28, md 32, lg 36.
- Tipografia: **Geist** (interface) e **Geist Mono** (código), em `--caps-font-sans` / `-mono`.
  `--caps-text-xs…3xl`: 11, 12, 13, 14, 15, 18, 22, 28. Hierarquia por peso (600–650 em títulos).
  Rótulos de seção: 11–12px, 600, maiúsculas, `letter-spacing: 0.06em`, `--caps-text-3`.
- Camadas `--caps-z-*`: topbar 20, painel 30, popover 60, modal 80, toast 90.
- Movimento: `--caps-dur-fast` 90ms (hover), `--caps-dur` 150ms, `--caps-dur-slow` 240ms;
  curvas `--caps-ease` e `--caps-ease-out`. Entradas usam `capsPopIn` (fade + 4px).
  `prefers-reduced-motion` é respeitado globalmente.
- Layout: barra superior 48px, sidebar 208–380px (padrão 264), painel lateral 240–440px
  (padrão 280), cabeçalhos 48px, folga do painel 8px.

## Ícones

Usamos só **Lucide** (`lucide-solid/icons/<nome>`), com traço de 1,75px (regra global
`.lucide` em `styles.css`). A cor vem de `color`. O `<Symbol>` antigo ainda aceita nomes
Material e os converte para Lucide (`utils/symbolIcons.ts`). Em código novo, importe o
ícone Lucide direto.

## Estados interativos

| Estado | Tratamento |
| --- | --- |
| Hover | `--caps-hover`; o texto sobe para `--caps-text` |
| Pressionado | `--caps-active`; botões descem 0,5px, ícones escalam 0,96 |
| Selecionado | `--caps-selected` + entalhe lima de 2–3px na borda esquerda |
| Foco (teclado) | `--caps-focus-ring`: anel lima de 2px afastado da superfície |
| Foco de campo | linha `--caps-accent-line` + halo `--caps-accent-soft` de 3px |
| Desabilitado | opacidade 0,4 ou `--caps-text-disabled`; cursor `not-allowed` |
| Erro | `--caps-danger` + `--caps-danger-soft` |

> Diretivas do Solid (`use:floating` para tooltip, menu de contexto e cartão de usuário) só
> funcionam em elementos nativos. Em botões com tooltip, use `<button class={cva()}>`
> em vez de `styled()`.

## Estrutura da aplicação

| Peça | Arquivo | Notas |
| --- | --- | --- |
| Barra superior | `src/interface/shell/TopBar.tsx` | marca, Início, Conversas, Comunidades, Amigos, busca, sino, configurações, perfil |
| Seletor de comunidades | `shell/CommunitySwitcher.tsx` | busca, teclado, pastas, arrastar (`navigation/servers/railDrag.ts`), menu da comunidade |
| Sidebar única | `src/interface/Sidebar.tsx` | contextual (canais ou conversas), redimensionável, Ctrl+B |
| Mini-player | `shell/CallDock.tsx` | fixo na sidebar durante chamadas; o PiP flutuante aparece só com vídeo |
| Command Palette | `shell/CommandPalette.tsx` | Ctrl/⌘+K; navegação, ações, voz e presença |
| Notificações | `shell/NotificationCenter.tsx` | menções não lidas, pedidos de amizade e conversas não lidas |
| Abas do celular | `shell/BottomTabs.tsx` | substituem a barra superior até 600px |
| Atalhos globais | `shell/GlobalKeybinds.tsx` | Ctrl+K, Ctrl+B, Ctrl+Alt+↑/↓, Ctrl+Shift+M/D |
| Central social | `src/interface/Home.tsx` + `home/*` | salas de voz, conversas recentes, comunidades, amigos online |

## Componentes

| Componente | Arquivo | Notas |
| --- | --- | --- |
| CapsMark | `design/CapsMark.tsx` | símbolo da marca |
| Popover | `design/Popover.tsx` | painel ancorado; fecha com Esc ou clique fora |
| ResizeHandle | `design/ResizeHandle.tsx` | arrastar, setas do teclado, duplo clique restaura |
| EmptyState | `design/EmptyState.tsx` | ícone, título, descrição e ações |
| Button / IconButton | `design/Button.tsx`, `IconButton.tsx` | `filled` = acento; `tonal`, `text`, `_muted` |
| MenuButton | `design/MenuButton.tsx` | linhas da sidebar com entalhe lima |
| CategoryButton | `design/CategoryButton.tsx` | linhas de configurações; `.Group` = lista com divisórias |
| Dialog | `design/Dialog.tsx` | modais; última ação = primária |
| Tooltip | `floating/Tooltip.tsx` | chip invertido compacto |
| UserCard | `floating/UserCard.tsx` | cartão de perfil; `full` = perfil completo (modal) |
| ContextMenu | `app/menus/ContextMenu.tsx` | itens de 30px, capitalização normal |
| StaffBadge | `features/profiles/StaffBadge.tsx` | equipe da plataforma (bits 2048 Administrador, 4096 Moderador) |
| LoadingScreen | `design/LoadingScreen.tsx` | símbolo com a luz pulsando + barra |

## Tema

O preset padrão é `caps` (escuro), e o tema claro usa a rampa "paper" equivalente. Escolher
uma cor própria em Aparência troca para o preset Material You (`Personalizado`). Fontes
antigas (IBM Plex) migram para Geist automaticamente (`stores/Theme.ts → clean()`).

## Dados que ainda não existem

Esses recursos ficam fora da interface até o servidor oferecer o dado:
- "Jogando agora";
- histórico persistente de notificações;
- busca global de mensagens.

Não use dados fictícios no lugar.
