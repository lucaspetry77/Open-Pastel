# PRD — Ferramenta de Feedback Visual em HTML (clone enxuto do Pastel)

## 1. Visão

Uma ferramenta web onde o dono sobe **um arquivo HTML single-file**, recebe um **link
compartilhável**, e qualquer pessoa com o link consegue **comentar em cima do HTML
renderizado** — se identificando **só com um nome**, sem criar conta. O dono abre o mesmo
link e vê todos os comentários.

Não é o Pastel inteiro. É o núcleo: subir → compartilhar → comentar visualmente.

## 2. Escopo do v1 (o que ENTRA)

- Upload de **1 arquivo HTML single-file** (CSS/JS inline, sem assets externos).
- Geração de **link público único** por upload (ex: `/b/{id}`).
- Renderização do HTML dentro de um `<iframe srcdoc>` numa **largura de preview fixa
  (1280px, desktop)**.
- **Modo comentar**: botão que ativa uma camada por cima do iframe; clicar cria um pin
  na coordenada `x/y` (em %); abre input de texto.
- **Identidade só por nome**: na primeira ação, pede o nome; salva em `localStorage`.
  Sem senha, sem verificação.
- **Lista de comentários** lateral, cada um com nome do autor, texto, timestamp.
- Clicar num pin realça o comentário na lista e vice-versa.
- **Deletar** o próprio comentário.
- Persistência real: comentários e HTML sobrevivem a refresh e aparecem pra qualquer um
  com o link.

## 3. O que NÃO entra no v1 (limitações assumidas de propósito)

- Sem HTML com assets externos (só single-file via `srcdoc`).
- Sem ancoragem de pin a elemento do DOM — só coordenada x/y.
- Sem toggle mobile/responsivo — largura de preview é fixa.
- Sem login/conta/autenticação de dono. Quem tem o link, tem acesso.
- Sem resolver/status, sem tags, sem deadline, sem thread/replies.
- Sem editar comentário (só criar e deletar).
- Sem realtime — atualização por refresh (ou polling leve, opcional).
- Sem múltiplos arquivos por link (1 upload = 1 board = 1 link).
- Sem senha ou expiração de link.

## 4. Fluxos

### 4.1 Dono cria um board
1. Home tem um dropzone / input de arquivo `.html`.
2. Valida: extensão `.html`, tamanho ≤ 2MB.
3. Lê o conteúdo como texto, cria um `board` (id + html_content).
4. Redireciona para `/b/{id}` e mostra o link pronto pra copiar.

### 4.2 Reviewer comenta
1. Abre `/b/{id}` → vê o HTML renderizado no iframe (1280px).
2. Clica em **"Comentar"** → camada de overlay transparente cobre o iframe.
3. Primeiro clique/ação → se não tem nome no `localStorage`, pede nome (modal simples).
4. Clica num ponto → cria pin naquela coordenada `x%/y%` → abre input → salva.
5. Sai do modo comentar → volta a poder navegar/scrollar o HTML normalmente.

### 4.3 Todos veem os comentários
- Pins renderizados sobre o iframe nas coordenadas salvas.
- Painel lateral lista todos os comentários em ordem cronológica.

## 5. Pegadinhas técnicas (LER — é onde a maioria erra)

1. **Iframe intercepta cliques.** No modo comentar, sobreponha uma `div` overlay com
   `position:absolute; inset:0; z-index` acima do iframe capturando os cliques. Fora do
   modo comentar, essa div some (`pointer-events:none` ou removida) pra deixar navegar.

2. **Coordenada relativa, não absoluta.** Salve `pos_x`/`pos_y` como **porcentagem**
   (0–100) relativa ao container do iframe, não pixels. Assim o pin renderiza certo
   independente de zoom da página host. Ex: `pos_x = (clickX / containerWidth) * 100`.

3. **Scroll do conteúdo.** Se o HTML for mais alto que a viewport e o usuário scrollar
   dentro do iframe, a coordenada y precisa considerar o scroll do iframe, OU você trava
   a altura e deixa o board inteiro rolar (pin ancorado ao documento, não à viewport).
   **Decisão v1:** o container do iframe tem a altura total do conteúdo (iframe sem scroll
   próprio, a página host que rola). Assim `y%` é relativo ao documento inteiro e o pin
   nunca desancora. Ajuste a altura do iframe ao `scrollHeight` do conteúdo após load.

4. **`srcdoc` e sandbox.** Use `<iframe srcdoc={html} sandbox="allow-same-origin allow-scripts">`.
   `allow-scripts` deixa o JS inline do HTML rodar. Avalie o risco: é HTML de terceiros
   (de quem subiu), então mantenha o sandbox e **nunca** rode esse HTML no mesmo contexto
   da sua app sem sandbox.

5. **Segurança do conteúdo.** Como qualquer um pode subir HTML com JS, o `sandbox` do
   iframe é sua proteção. Não injete o html_content em nenhum lugar fora do `srcdoc`.

## 6. Modelo de dados

```
boards
  id            uuid (pk)        -- vira o link /b/{id}
  html_content  text             -- o HTML single-file inteiro
  preview_width int  default 1280
  created_at    timestamptz

comments
  id            uuid (pk)
  board_id      uuid (fk -> boards.id)
  author_name   text
  pos_x         numeric          -- % 0..100 (horizontal)
  pos_y         numeric          -- % 0..100 (vertical, relativo ao documento inteiro)
  text          text
  created_at    timestamptz
```

## 7. Stack sugerida

- **Front:** React + Vite (ou o que você já usa no vibe coding).
- **Back/DB/Storage:** Supabase (Postgres pras 2 tabelas). O `html_content` cabe num
  campo `text` — não precisa de bucket no v1.
- **Sem servidor próprio.** Chamadas direto ao Supabase client.
- **RLS:** deixe leitura/escrita públicas nas 2 tabelas pro v1 (qualquer um com link
  comenta). Anote como dívida de segurança conhecida.

## 8. Critérios de aceite (Definition of Done)

- [ ] Subo um `.html` single-file e recebo um link `/b/{id}`.
- [ ] Abro o link em aba anônima → vejo o HTML renderizado igual ao original.
- [ ] Ativo "Comentar", informo meu nome uma vez, clico e crio um pin com texto.
- [ ] Dou refresh → o pin e o comentário continuam lá.
- [ ] Abro em outro navegador → vejo o mesmo board e o mesmo comentário.
- [ ] Consigo deletar um comentário que eu criei.
- [ ] Fora do modo comentar, consigo scrollar/navegar o HTML normalmente.
- [ ] Pins ficam ancorados no lugar certo mesmo depois de scrollar.

## 9. Roadmap pós-v1 (não construir agora)

- v2: toggle de largura (mobile/tablet/desktop) com recálculo de pins.
- v2: resolver comentário + filtro resolvidos/abertos.
- v2: replies/thread.
- v3: ancoragem a elemento do DOM (seletor CSS) via script injetado no iframe.
- v3: suporte a upload de .zip (HTML + assets) servido via Storage.
- v3: realtime com Supabase Realtime.