-- ============================================================
-- Pastel HTML Visual Feedback — Supabase Schema
-- ============================================================

-- 1. Tabela de Boards
CREATE TABLE IF NOT EXISTS public.boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  html_content TEXT NOT NULL,
  preview_width INT NOT NULL DEFAULT 1280,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabela de Comentários
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  pos_x NUMERIC NOT NULL, -- Coordenada horizontal em % (0 a 100)
  pos_y NUMERIC NOT NULL, -- Coordenada vertical em % (0 a 100, altura total do doc)
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para busca rápida de comentários por board
CREATE INDEX IF NOT EXISTS idx_comments_board_id ON public.comments(board_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at ASC);

-- ============================================================
-- Políticas de Acesso (RLS) — Acesso Público Aberto para v1
-- (Dívida de segurança assumida: sem login, qualquer pessoa com o link pode ler e comentar)
-- ============================================================

ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Políticas para Boards (Qualquer um pode criar e ler boards)
CREATE POLICY "Permitir leitura pública de boards"
  ON public.boards FOR SELECT
  USING (true);

CREATE POLICY "Permitir criação pública de boards"
  ON public.boards FOR INSERT
  WITH CHECK (true);

-- Políticas para Comments (Qualquer um pode ler, criar e excluir comentários)
CREATE POLICY "Permitir leitura pública de comentários"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Permitir criação pública de comentários"
  ON public.comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão pública de comentários"
  ON public.comments FOR DELETE
  USING (true);
