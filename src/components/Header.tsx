import React, { useState } from 'react';
import {
  MousePointer,
  MessageSquarePlus,
  Share2,
  Check,
  PanelRight,
  Database,
  ArrowLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { isSupabaseConfigured } from '../lib/supabase';

interface HeaderProps {
  boardId?: string;
  isCommentingMode: boolean;
  onToggleCommentingMode: () => void;
  commentCount: number;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  boardId,
  isCommentingMode,
  onToggleCommentingMode,
  commentCount,
  isSidebarOpen,
  onToggleSidebar,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header
      style={{
        height: 64,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 200,
      }}
    >
      {/* Esquerda: Logo e Voltar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
                fill="white"
              />
              <circle cx="12" cy="9" r="3.5" fill="#4338ca" />
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em' }}>
                Pastel
              </span>
              <span className="badge badge-primary">v1.0</span>
            </div>
          </div>
        </Link>

        {boardId && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              paddingLeft: 12,
              borderLeft: '1px solid var(--border-subtle)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: 'var(--text-muted)',
              }}
            >
              /b/{boardId.slice(0, 8)}...
            </span>
          </div>
        )}
      </div>

      {/* Centro: Modos Navegar vs Comentar */}
      {boardId && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-main)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 3,
            gap: 4,
          }}
        >
          <button
            onClick={() => isCommentingMode && onToggleCommentingMode()}
            className={`btn btn-sm ${!isCommentingMode ? 'btn-secondary' : 'btn-ghost'}`}
            style={{
              borderRadius: 'var(--radius-sm)',
              boxShadow: !isCommentingMode ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <MousePointer size={14} />
            Navegar
          </button>
          <button
            onClick={() => !isCommentingMode && onToggleCommentingMode()}
            className={`btn btn-sm ${isCommentingMode ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              borderRadius: 'var(--radius-sm)',
              boxShadow: isCommentingMode
                ? '0 0 12px rgba(99, 102, 241, 0.4)'
                : 'none',
            }}
          >
            <MessageSquarePlus size={14} />
            Comentar
          </button>
        </div>
      )}

      {/* Direita: Ações */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Indicador de persistência */}
        <div
          title={
            isSupabaseConfigured
              ? 'Conectado ao Supabase (Persistência em nuvem ativa)'
              : 'Modo Local (Armazenado no navegador). Configure o Supabase para sincronizar entre navegadores.'
          }
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 11,
            color: isSupabaseConfigured ? 'var(--accent-emerald)' : 'var(--accent-amber)',
            background: isSupabaseConfigured
              ? 'rgba(16, 185, 129, 0.1)'
              : 'rgba(245, 158, 11, 0.1)',
            border: `1px solid ${
              isSupabaseConfigured
                ? 'rgba(16, 185, 129, 0.25)'
                : 'rgba(245, 158, 11, 0.25)'
            }`,
            borderRadius: 'var(--radius-full)',
            padding: '3px 8px',
          }}
        >
          <Database size={12} />
          <span>{isSupabaseConfigured ? 'Supabase' : 'Local'}</span>
        </div>

        {boardId && (
          <>
            <button
              onClick={handleCopyLink}
              className={`btn btn-sm ${copied ? 'btn-secondary' : 'btn-secondary'}`}
              title="Copiar link do board para compartilhar"
            >
              {copied ? (
                <>
                  <Check size={14} color="#10b981" />
                  <span style={{ color: '#10b981' }}>Link copiado!</span>
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  <span>Compartilhar</span>
                </>
              )}
            </button>

            <button
              onClick={onToggleSidebar}
              className={`btn btn-sm ${isSidebarOpen ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ position: 'relative' }}
              title={isSidebarOpen ? 'Esconder comentários' : 'Mostrar comentários'}
            >
              <PanelRight size={16} />
              {commentCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    fontSize: 10,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {commentCount}
                </span>
              )}
            </button>
          </>
        )}
      </div>
    </header>
  );
};
