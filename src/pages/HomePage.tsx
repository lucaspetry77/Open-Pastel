import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dropzone } from '../components/Dropzone';
import { Header } from '../components/Header';
import { createBoard, syncAllLocalBoards } from '../services/boardService';
import { MessageSquare, Share2, Layers, CheckCircle2 } from 'lucide-react';
import { Board } from '../types/index';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [recentBoards, setRecentBoards] = useState<Board[]>([]);

  useEffect(() => {
    // Sincroniza boards locais para o Supabase caso tenham sido criados antes da chave
    syncAllLocalBoards();

    try {
      const raw = localStorage.getItem('pastel_local_boards');
      if (raw) {
        const parsed = JSON.parse(raw);
        const list = Object.values(parsed) as Board[];
        list.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setRecentBoards(list.slice(0, 4));
      }
    } catch {
      // Ignora erro
    }
  }, []);

  const handleUploadHtml = async (htmlContent: string) => {
    setIsUploading(true);
    try {
      const board = await createBoard(htmlContent);
      navigate(`/b/${board.id}`);
    } catch (err: any) {
      alert(`Erro ao criar board: ${err.message || 'Tente novamente.'}`);
      setIsUploading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        isCommentingMode={false}
        onToggleCommentingMode={() => {}}
        commentCount={0}
        isSidebarOpen={false}
        onToggleSidebar={() => {}}
      />

      <main
        style={{
          flex: 1,
          maxWidth: 1080,
          margin: '0 auto',
          padding: '60px 24px',
          width: '100%',
        }}
      >
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div
            className="badge badge-primary"
            style={{ marginBottom: 16, padding: '4px 12px' }}
          >
            Clone Enxuto do Pastel
          </div>

          <h1
            style={{
              fontSize: 48,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              marginBottom: 16,
              background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Feedback visual direto no seu HTML
          </h1>

          <p
            style={{
              fontSize: 18,
              color: 'var(--text-secondary)',
              maxWidth: 640,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Suba um arquivo HTML single-file, receba um link compartilhável e colete
            comentários com pins visuais ancorados na coordenada exata — sem criar conta.
          </p>
        </div>

        {/* Dropzone Upload */}
        <Dropzone onUploadHtml={handleUploadHtml} isUploading={isUploading} />

        {/* 3 Passos */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
            marginTop: 64,
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
                marginBottom: 16,
              }}
            >
              <Layers size={20} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              1. Suba seu HTML Single-File
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Arquivos até 2MB com CSS e JS inline são renderizados perfeitamente dentro de
              um sandbox seguro de 1280px.
            </p>
          </div>

          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-emerald)',
                marginBottom: 16,
              }}
            >
              <Share2 size={20} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              2. Compartilhe o Link Único
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Um link público é gerado instantaneamente. Qualquer pessoa com o link pode
              abrir e visualizar a página.
            </p>
          </div>

          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(244, 63, 94, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-rose)',
                marginBottom: 16,
              }}
            >
              <MessageSquare size={20} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              3. Comente com Pins Visuais
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Basta informar um nome e clicar em qualquer lugar da tela para fixar um
              marcador numerado com seu comentário.
            </p>
          </div>
        </div>

        {/* Boards Recentes (se houver) */}
        {recentBoards.length > 0 && (
          <div style={{ marginTop: 60 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              Boards Criados Recentemente neste Navegador
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentBoards.map((b) => (
                <div
                  key={b.id}
                  onClick={() => navigate(`/b/${b.id}`)}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = 'var(--accent-primary)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = 'var(--border-subtle)')
                  }
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <CheckCircle2 size={18} color="var(--accent-primary)" />
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        /b/{b.id}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Criado em {new Date(b.created_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-sm">Abrir Board</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
