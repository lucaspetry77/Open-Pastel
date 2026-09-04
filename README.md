# Pastel — Ferramenta de Feedback Visual em HTML

Clone enxuto e moderno do Pastel para subir um arquivo HTML single-file, gerar um link compartilhável e permitir que qualquer pessoa comente visualmente com pins ancorados nas coordenadas do documento.

## 🚀 Funcionalidades

- **Upload Single-File:** Suporte a arquivos `.html` (até 2MB) com CSS e JavaScript inline.
- **Link Público Único:** Cada upload cria um board acessível via `/b/:id`.
- **Preview Fiel (1280px):** Renderização dentro de `<iframe srcdoc sandbox="allow-same-origin allow-scripts">` com ajuste automático de `scrollHeight` para manter o scroll contínuo e a ancoragem de pins imutável.
- **Modo Comentar & Navegar:** Alternância instantânea. No modo comentar, uma camada de overlay captura cliques com cálculo de coordenadas relativas em porcentagem (`pos_x%`, `pos_y%`).
- **Identificação Descomplicada:** Pede apenas o nome do autor na primeira interação (salvo no `localStorage`), sem necessidade de senha ou cadastro.
- **Painel Lateral Sincronizado:** Lista comentários cronologicamente. Clicar em um pin foca o comentário na lista e vice-versa.
- **Exclusão de Comentários Próprios:** Permite ao autor remover os próprios comentários.
- **Persistência Dupla (Supabase + Local):** Conexão nativa com Supabase via `@supabase/supabase-js`. Se as variáveis de ambiente não estiverem configuradas, o sistema opera de forma transparente em `localStorage`, permitindo testes e uso imediatos sem fricção.

---

## 🛠️ Como Executar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

---

## 🗄️ Configuração do Supabase (Opcional)

Para persistir os boards e comentários na nuvem e permitir o compartilhamento entre diferentes dispositivos e navegadores:

1. Crie um projeto no [Supabase](https://supabase.com/).
2. No menu **SQL Editor**, execute o script presente em `supabase/schema.sql`.
3. Crie um arquivo `.env` na raiz do projeto (baseado em `.env.example`):
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
   ```
4. Reinicie o servidor (`npm run dev`). O indicador no topo mudará de **Local** para **Supabase**.

---

## 🧪 Testes

Para rodar os testes unitários de regras de negócio e camada de dados:

```bash
npx tsx scratch/test_service.js
```
