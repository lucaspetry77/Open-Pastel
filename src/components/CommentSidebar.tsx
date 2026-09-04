import React, { useEffect, useRef } from 'react';
import { Comment } from '../types';
import { Trash2, MessageSquare, User, Clock, ChevronRight } from 'lucide-react';
import { getMyCommentIds, getStoredAuthorName } from '../services/boardService';

interface CommentSidebarProps {
  comments: Comment[];
  isOpen: boolean;
  onToggle: () => void;
  selectedCommentId: string | null;
  onSelectComment: (comment: Comment) => void;
  onDeleteComment: (id: string) => void;
  onStartCommenting: () => void;
  isCommentingMode: boolean;
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'agora mesmo';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `há ${diffMinutes} min`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `há ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'ontem';
    if (diffDays < 30) return `há ${diffDays} dias`;
    return date.toLocaleDateString('pt-BR');
  } catch {
    return 'recentemente';
  }
}

export const CommentSidebar: React.FC<CommentSidebarProps> = ({
  comments,
  isOpen,
  onToggle,
  selectedCommentId,
  onSelectComment,
  onDeleteComment,
  onStartCommenting,
  isCommentingMode,
}) => {
  const myCommentIds = getMyCommentIds();
  const currentAuthorName = getStoredAuthorName();
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedCommentId && selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedCommentId]);

  if (!isOpen) return null;

  return (
    <aside
      style={{
        width: 360,
        minWidth: 360,
        height: 'calc(100vh - 64px)',
        position: 'sticky',
        top: 64,
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 90,
      }}
    >
      {/* Header do painel lateral */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessageSquare size={18} color="var(--accent-primary)" />
          <h2 style={{ fontSize: 15, fontWeight: 700 }}>Comentários</h2>
          <span className="badge badge-primary">{comments.length}</span>
        </div>

        <button
          onClick={onToggle}
          className="btn btn-ghost btn-sm"
          style={{ padding: 4 }}
          title="Recolher painel"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Lista com scroll */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {comments.length === 0 ? (
          <div
            style={{
              padding: '36px 16px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
              }}
            >
              <MessageSquare size={24} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Nenhum comentário ainda</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Ative o modo <strong>Comentar</strong> e clique em qualquer parte do HTML para
              deixar um feedback visual.
            </p>
            {!isCommentingMode && (
              <button
                onClick={onStartCommenting}
                className="btn btn-primary btn-sm"
                style={{ marginTop: 8 }}
              >
                Ativar Modo Comentar
              </button>
            )}
          </div>
        ) : (
          comments.map((c, index) => {
            const isSelected = c.id === selectedCommentId;
            const isMine =
              myCommentIds.has(c.id) ||
              (Boolean(currentAuthorName) &&
                c.author_name.toLowerCase() === currentAuthorName.toLowerCase());

            return (
              <div
                key={c.id}
                ref={isSelected ? selectedRef : null}
                id={`comment-card-${c.id}`}
                onClick={() => onSelectComment(c)}
                style={{
                  background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                  border: `1px solid ${
                    isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'
                  }`,
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 0 16px rgba(99, 102, 241, 0.25)' : 'none',
                }}
              >
                {/* Linha superior: Marcador + Autor + Timestamp + Ações */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Badge do número do Pin */}
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: isSelected
                          ? 'var(--accent-rose)'
                          : 'var(--accent-primary)',
                        color: 'white',
                        fontSize: 11,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {index + 1}
                    </div>

                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {c.author_name}
                    </span>

                    {isMine && (
                      <span
                        className="badge"
                        style={{
                          background: 'rgba(99, 102, 241, 0.12)',
                          color: '#a5b4fc',
                          fontSize: 9,
                          padding: '1px 5px',
                        }}
                      >
                        Você
                      </span>
                    )}
                  </div>

                  {isMine && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Deseja realmente deletar este comentário?')) {
                          onDeleteComment(c.id);
                        }
                      }}
                      className="btn btn-ghost btn-sm"
                      style={{
                        padding: '4px',
                        color: 'var(--text-muted)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                      title="Deletar meu comentário"
                    >
                      <Trash2 size={14} color="#f43f5e" />
                    </button>
                  )}
                </div>

                {/* Texto do comentário */}
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--text-primary)',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {c.text}
                </p>

                {/* Linha inferior: Timestamp e Coordenada */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 10,
                    fontSize: 11,
                    color: 'var(--text-muted)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} />
                    <span>{formatRelativeTime(c.created_at)}</span>
                  </div>
                  <span>
                    Posição: {Math.round(c.pos_x)}%, {Math.round(c.pos_y)}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
