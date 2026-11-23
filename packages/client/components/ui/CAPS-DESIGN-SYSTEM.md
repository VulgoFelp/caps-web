# CAPS design system — "Grafite e lima"

A interface do CAPS é escura, compacta e calma. Os neutros grafite quentes
carregam quase toda a interface, e um único acento lima marca o que importa:
ação primária, seleção e foco. Nada de roxo saturado, gradientes decorativos
ou cantos em pílula.

Fonte da verdade: `themes/capsTheme.ts` (cores e escalas) e
`caps-components.css` (componentes MDUI/Material Web).
Os tokens são expostos como variáveis CSS `--caps-*` no `body`.

## Cores

| Papel | Token | Uso |
| --- | --- | --- |
| Trilho de servidores | `--caps-bg-rail` | camada mais escura |
| Barras laterais | `--caps-bg-sidebar` | canais, membros, navegação de configurações |
| App | `--caps-bg-app` | conteúdo, chat, páginas |
| Elevado | `--caps-bg-raised` | campo de mensagem, listas de configurações |
| Sobreposição | `--caps-bg-overlay` | menus, modais, tooltips de ação |
| Campo | `--caps-bg-field` | inputs, selects |
| Hover / ativo / selecionado | `--caps-hover`, `--caps-active`, `--caps-selected` | véus neutros sobre qualquer superfície |
| Linhas | `--caps-line-soft`, `--caps-line`, `--caps-line-strong` | divisórias de 1px |
| Texto | `--caps-text`, `--caps-text-2`, `--caps-text-3`, `--caps-text-disabled` | primário, secundário, metadado, desabilitado |
| Acento | `--caps-accent`, `--caps-on-accent`, `--caps-accent-soft`, `--caps-accent-text` | botão primário, seleção, foco, links |
| Menção | `--caps-mention`, `--caps-mention-soft` | âmbar: mensagens que citam você |
| Semânticas | `--caps-danger`, `--caps-success`, `--caps-warning`, `--caps-info` | estados |

Regras:
- No máximo **uma** ação com acento por tela. O resto é `tonal`, `outlined` ou `text`.
- Seleção em listas é um véu neutro (`--caps-selected`) mais o **entalhe lima**
  de 3px na borda esquerda. Não pinte o item inteiro com o acento.
- Profundidade vem de degraus de superfície e linhas de 1px. Sombras só em
  camadas flutuantes (`--caps-shadow-pop`, `--caps-shadow-modal`).

## Escalas

- Espaçamento (`--caps-space-1…10`): 2, 4, 6, 8, 12, 16, 20, 24, 32, 48 px.
- Raios (`--caps-radius-*`): xs 3, sm 5, md 7, lg 10, server 12. Containers nunca passam de 12px;
  só avatares de usuário, pontos de status e toggles são redondos.
- Alturas de controle (`--caps-h-*`): xs 24, sm 28, md 32, lg 36.
- Tipografia: IBM Plex Sans (interface) e IBM Plex Mono (código).
  `--caps-text-xs…3xl`: 11, 12, 13, 14, 15, 18, 22, 28. Hierarquia por peso
  (600 em títulos), tracking negativo leve em títulos grandes. Rótulos de
  seção: 11px, 600, maiúsculas, `letter-spacing: 0.06em`, `--caps-text-3`.
- Movimento: `--caps-dur-fast` 90ms, `--caps-dur` 150ms, `--caps-dur-slow` 240ms;
  curvas `--caps-ease` e `--caps-ease-out`. `prefers-reduced-motion` é respeitado globalmente.
- Layout: trilho 64px, barra lateral 240px, membros 232px, cabeçalho 48px.

## Estados interativos

| Estado | Tratamento |
| --- | --- |
| Hover | `--caps-hover` + texto sobe para `--caps-text` |
| Pressionado | `--caps-active`; botões descem 0,5px, ícones escalam 0,96 |
| Foco (teclado) | `--caps-focus-ring`: anel lima de 2px afastado da superfície |
| Foco de campo | borda lima 1px + halo `--caps-accent-soft` de 3px |
| Desabilitado | texto `--caps-text-disabled`, sem sombra, cursor `not-allowed` |
| Erro | borda `--caps-danger` + halo `--caps-danger-soft` |

O ripple do Material foi reduzido a uma camada de estado discreta
(`--md-ripple-pressed-opacity` ≈ 0,06–0,08, sem hover).

## Componentes

| Componente | Arquivo | Notas |
| --- | --- | --- |
| Button | `components/design/Button.tsx` | xs 28 / sm 32 / md 36; `filled` = acento; grupos viram controle segmentado |
| IconButton | `components/design/IconButton.tsx` | quadrado suave, ícones 18–20px, `aria-selected` para estados ligados |
| MenuButton | `components/design/MenuButton.tsx` | linhas das barras laterais, entalhe lima na seleção |
| Header | `components/layout/Header.tsx` | 48px, rente, divisória inferior |
| CategoryButton | `components/design/CategoryButton.tsx` | linhas de configurações; `.Group` = lista única com divisórias |
| Dialog | `components/design/Dialog.tsx` | raio 12, última ação = primária, entrada 180ms |
| FloatingSelect | `components/design/FloatingSelect.tsx` | mesmo visual do campo de texto |
| Switch (permissões) | `components/design/Switch.tsx` | segmentado: verde permite, vermelho nega |
| Tooltip | `components/floating/Tooltip.tsx` | chip invertido compacto |
| ContextMenu | `app/menus/ContextMenu.tsx` | itens de 30px, capitalização normal |
| StaffBadge | `features/profiles/StaffBadge.tsx` | badges de equipe da plataforma (bits 2048 Administrador, 4096 Moderador): escudo ao lado do nome (`sm`) e pílula no perfil (`lg`) |
| Campos MDUI | `caps-components.css` | text-field, menus, checkbox, slider, snackbar, FAB |

## Tema

O preset padrão é `caps` (modo escuro). Ao escolher uma cor própria em
Configurações → Aparência, o app troca para o preset Material You
(`Personalizado`). Usuários que estavam nos acentos padrão antigos migram
automaticamente para `caps` (`stores/Theme.ts → clean()`).
