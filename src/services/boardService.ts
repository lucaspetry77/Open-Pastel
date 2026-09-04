import { Board, Comment } from '../types/index';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_BOARDS_KEY = 'pastel_local_boards';
const LOCAL_COMMENTS_KEY = 'pastel_local_comments';
const MY_COMMENTS_KEY = 'pastel_my_comment_ids';
const AUTHOR_NAME_KEY = 'pastel_author_name';

// Utilitário para gerar UUID caso não haja crypto.randomUUID (compatibilidade total)
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Helpers de LocalStorage
function getLocalBoards(): Record<string, Board> {
  try {
    const data = localStorage.getItem(LOCAL_BOARDS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveLocalBoards(boards: Record<string, Board>) {
  localStorage.setItem(LOCAL_BOARDS_KEY, JSON.stringify(boards));
}

function getLocalComments(): Comment[] {
  try {
    const data = localStorage.getItem(LOCAL_COMMENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalComments(comments: Comment[]) {
  localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(comments));
}

export function getStoredAuthorName(): string {
  return localStorage.getItem(AUTHOR_NAME_KEY) || '';
}

export function setStoredAuthorName(name: string): void {
  localStorage.setItem(AUTHOR_NAME_KEY, name.trim());
}

export function getMyCommentIds(): Set<string> {
  try {
    const raw = localStorage.getItem(MY_COMMENTS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function addMyCommentId(id: string): void {
  const ids = getMyCommentIds();
  ids.add(id);
  localStorage.setItem(MY_COMMENTS_KEY, JSON.stringify(Array.from(ids)));
}

// -------------------------------------------------------------
// Operações de Board
// -------------------------------------------------------------

export async function createBoard(html_content: string): Promise<Board> {
  const newBoard: Board = {
    id: generateUUID(),
    html_content,
    preview_width: 1280,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('boards')
      .insert({
        id: newBoard.id,
        html_content: newBoard.html_content,
        preview_width: newBoard.preview_width,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar board no Supabase:', error);
      throw new Error(`Falha ao salvar no banco: ${error.message}`);
    }
    return data as Board;
  }

  // Fallback LocalStorage
  const boards = getLocalBoards();
  boards[newBoard.id] = newBoard;
  saveLocalBoards(boards);
  return newBoard;
}

export async function getBoard(id: string): Promise<Board | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      return data as Board;
    }
  }

  // Fallback LocalStorage
  const boards = getLocalBoards();
  const localBoard = boards[id];

  // Se o board existia apenas localmente e agora o Supabase está ativo,
  // faz o upload automático para que fique público para todos!
  if (localBoard && isSupabaseConfigured && supabase) {
    try {
      await supabase.from('boards').upsert({
        id: localBoard.id,
        html_content: localBoard.html_content,
        preview_width: localBoard.preview_width,
      });

      const localComments = getLocalComments().filter((c) => c.board_id === id);
      if (localComments.length > 0) {
        await supabase.from('comments').upsert(
          localComments.map((c) => ({
            id: c.id,
            board_id: c.board_id,
            author_name: c.author_name,
            pos_x: c.pos_x,
            pos_y: c.pos_y,
            text: c.text,
          }))
        );
      }
    } catch (syncErr) {
      console.warn('Falha silenciosa ao sincronizar board local para Supabase:', syncErr);
    }
  }

  return localBoard || null;
}

export async function syncAllLocalBoards(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const boards = getLocalBoards();
    const list = Object.values(boards);
    for (const b of list) {
      await supabase.from('boards').upsert({
        id: b.id,
        html_content: b.html_content,
        preview_width: b.preview_width,
      });
    }

    const comments = getLocalComments();
    if (comments.length > 0) {
      await supabase.from('comments').upsert(
        comments.map((c) => ({
          id: c.id,
          board_id: c.board_id,
          author_name: c.author_name,
          pos_x: c.pos_x,
          pos_y: c.pos_y,
          text: c.text,
        }))
      );
    }
  } catch (err) {
    console.warn('Erro ao sincronizar boards locais:', err);
  }
}

// -------------------------------------------------------------
// Operações de Comentários
// -------------------------------------------------------------

export async function getComments(boardId: string): Promise<Comment[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('board_id', boardId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar comentários do Supabase:', error);
      // Fallback para local
    } else if (data) {
      return data as Comment[];
    }
  }

  // Fallback LocalStorage
  const allComments = getLocalComments();
  return allComments
    .filter((c) => c.board_id === boardId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function createComment(
  boardId: string,
  authorName: string,
  posX: number,
  posY: number,
  text: string
): Promise<Comment> {
  const newComment: Comment = {
    id: generateUUID(),
    board_id: boardId,
    author_name: authorName.trim(),
    pos_x: Number(posX.toFixed(2)),
    pos_y: Number(posY.toFixed(2)),
    text: text.trim(),
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        id: newComment.id,
        board_id: newComment.board_id,
        author_name: newComment.author_name,
        pos_x: newComment.pos_x,
        pos_y: newComment.pos_y,
        text: newComment.text,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar comentário no Supabase:', error);
      throw new Error(`Falha ao salvar comentário: ${error.message}`);
    }

    addMyCommentId(data.id);
    return data as Comment;
  }

  // Fallback LocalStorage
  const comments = getLocalComments();
  comments.push(newComment);
  saveLocalComments(comments);
  addMyCommentId(newComment.id);
  return newComment;
}

export async function deleteComment(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar comentário no Supabase:', error);
      throw new Error(`Falha ao deletar comentário: ${error.message}`);
    }
  }

  // LocalStorage sync
  const comments = getLocalComments();
  const updated = comments.filter((c) => c.id !== id);
  saveLocalComments(updated);

  const myIds = getMyCommentIds();
  myIds.delete(id);
  localStorage.setItem(MY_COMMENTS_KEY, JSON.stringify(Array.from(myIds)));
}
