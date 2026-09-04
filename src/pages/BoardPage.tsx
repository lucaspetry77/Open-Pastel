import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Board, Comment, NewPinPosition } from '../types';
import {
  getBoard,
  getComments,
  createComment,
  deleteComment,
  getStoredAuthorName,
} from '../services/boardService';
import { Header } from '../components/Header';
import { PinMarker } from '../components/PinMarker';
import { NewCommentPopover } from '../components/NewCommentPopover';
import { CommentSidebar } from '../components/CommentSidebar';
import { AuthorModal } from '../components/AuthorModal';
import { AlertTriangle, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';

export const BoardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [board, setBoard] = useState<Board | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCommentingMode, setIsCommentingMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);

  const [authorName, setAuthorName] = useState<string>(getStoredAuthorName());
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [pendingClickPosition, setPendingClickPosition] = useState<NewPinPosition | null>(null);

  const [newPinPosition, setNewPinPosition] = useState<NewPinPosition | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [iframeHeight, setIframeHeight] = useState<number>(900);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Carrega board e comentários
  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);

      const boardData = await getBoard(id);
      if (!boardData) {
        setError('Board não encontrado. Verifique o link informado.');
        setIsLoading(false);
        return;
      }
      setBoard(boardData);

      const commentsData = await getComments(id);
      setComments(commentsData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do board.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Atualiza altura do iframe baseado no scrollHeight do documento renderizado
  const adjustIframeHeight = useCallback(() => {
    if (!iframeRef.current) return;
    try {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        const height = Math.max(
          doc.documentElement?.scrollHeight || 0,
          doc.body?.scrollHeight || 0,
          700
        );
        if (height > 100) {
          setIframeHeight(height);
        }
      }
    } catch {
      // Falha silenciosa de sandbox cross-origin se houver
    }
  }, []);

  const handleIframeLoad = () => {
    adjustIframeHeight();
    // Reavalia após delays para imagens e fontes carregadas dinamicamente
    setTimeout(adjustIframeHeight, 200);
    setTimeout(adjustIframeHeight, 800);
    setTimeout(adjustIframeHeight, 2000);
  };

  // Trata clique na camada de overlay no modo comentar
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCommentingMode) return;

    // Se já estiver criando um comentário, não substitui imediatamente
    if (newPinPosition) {
      setNewPinPosition(null);
      return;
    }

    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Porcentagem precisa (0 a 100)
    const posX = Math.min(100, Math.max(0, (clickX / rect.width) * 100));
    const posY = Math.min(100, Math.max(0, (clickY / rect.height) * 100));

    const pos = { x: posX, y: posY };

    // Se ainda não tem nome do autor, abre modal primeiro
    const currentName = getStoredAuthorName();
    if (!currentName) {
      setPendingClickPosition(pos);
      setIsAuthorModalOpen(true);
      return;
    }

    setNewPinPosition(pos);
    setSelectedCommentId(null);
  };

  // Ao salvar o nome no modal
  const handleAuthorSuccess = (name: string) => {
    setAuthorName(name);
    setIsAuthorModalOpen(false);

    if (pendingClickPosition) {
      setNewPinPosition(pendingClickPosition);
      setPendingClickPosition(null);
    }
  };

  // Criação de comentário
  const handleCreateComment = async (text: string) => {
    if (!board || !newPinPosition || !authorName) return;

    try {
      setIsSubmittingComment(true);
      const newComment = await createComment(
        board.id,
        authorName,
        newPinPosition.x,
        newPinPosition.y,
        text
      );

      setComments((prev) => [...prev, newComment]);
      setNewPinPosition(null);
      setSelectedCommentId(newComment.id);
      setIsSidebarOpen(true);
    } catch (err: any) {
      alert(`Erro ao salvar comentário: ${err.message}`);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Deleção de comentário
  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      if (selectedCommentId === commentId) {
        setSelectedCommentId(null);
      }
    } catch (err: any) {
      alert(`Erro ao excluir comentário: ${err.message}`);
    }
  };

  // Seleção de comentário (bidirecional)
  const handleSelectComment = (comment: Comment) => {
    setSelectedCommentId(comment.id);
    setIsSidebarOpen(true);

    // Rola suavemente a página até a altura do pin
    if (containerRef.current) {
      const pinYPixels = (comment.pos_y / 100) * iframeHeight;
      const targetScroll = Math.max(0, pinYPixels - 200);
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  };

  // Carregamento
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <Loader2 size={36} className="pulse-indicator" color="var(--accent-primary)" />
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Carregando board e comentários...
        </p>
      </div>
    );
  }

  // Erro ou 404
  if (error || !board) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          padding: 24,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(244, 63, 94, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-rose)',
          }}
        >
          <AlertTriangle size={28} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>{error || 'Board não encontrado'}</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 460 }}>
          O board que você tentou acessar não existe ou não pôde ser carregado.
        </p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={16} />
          Voltar para a Página Inicial
        </Link>
      </div>
    );
  }

  const previewWidth = board.preview_width || 1280;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <Header
        boardId={board.id}
        isCommentingMode={isCommentingMode}
        onToggleCommentingMode={() => {
          setIsCommentingMode((prev) => {
            const next = !prev;
            if (!next) {
              setNewPinPosition(null);
            }
            return next;
          });
        }}
        commentCount={comments.length}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Banner flutuante no modo comentar */}
      {isCommentingMode && (
        <div
          style={{
            background: 'linear-gradient(90deg, #4338ca 0%, #6366f1 100%)',
            color: 'white',
            padding: '8px 16px',
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            position: 'sticky',
            top: 64,
            zIndex: 150,
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          }}
        >
          <span>
            📍 <strong>Modo Comentar Ativo</strong>: Clique em qualquer lugar da página para
            fixar um comentário visual.
          </span>
          <button
            onClick={() => {
              setIsCommentingMode(false);
              setNewPinPosition(null);
            }}
            className="btn btn-secondary btn-sm"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: 'none',
              padding: '2px 10px',
            }}
          >
            Sair do modo comentar
          </button>
        </div>
      )}

      {/* Área principal: Workspace central + Sidebar */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Container que centraliza o preview de 1280px */}
        <div
          style={{
            flex: 1,
            overflowX: 'auto',
            display: 'flex',
            justifyContent: 'center',
            padding: '24px 16px 80px',
            background: 'var(--bg-main)',
          }}
        >
          {/* Frame de Preview com largura fixa de 1280px */}
          <div
            ref={containerRef}
            style={{
              width: previewWidth,
              minWidth: previewWidth,
              height: iframeHeight,
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--border-subtle)',
              background: '#ffffff',
              overflow: 'visible',
            }}
          >
            {/* Iframe que renderiza o HTML */}
            <iframe
              ref={iframeRef}
              srcDoc={board.html_content}
              sandbox="allow-same-origin allow-scripts"
              onLoad={handleIframeLoad}
              title={`Board Preview ${board.id}`}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                display: 'block',
                pointerEvents: isCommentingMode ? 'none' : 'auto',
              }}
            />

            {/* Overlay transparente para captura de cliques no modo comentar */}
            {isCommentingMode && (
              <div
                ref={overlayRef}
                onClick={handleOverlayClick}
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 40,
                  cursor: 'crosshair',
                  backgroundColor: 'rgba(99, 102, 241, 0.04)',
                }}
              />
            )}

            {/* Marcadores de Pins salvos */}
            {comments.map((c, index) => (
              <PinMarker
                key={c.id}
                comment={c}
                index={index}
                isSelected={c.id === selectedCommentId}
                onSelect={handleSelectComment}
              />
            ))}

            {/* Popover de Novo Comentário */}
            {newPinPosition && (
              <NewCommentPopover
                position={newPinPosition}
                authorName={authorName || 'Visitante'}
                isSubmitting={isSubmittingComment}
                onCancel={() => setNewPinPosition(null)}
                onSubmit={handleCreateComment}
              />
            )}
          </div>
        </div>

        {/* Sidebar de comentários à direita */}
        <CommentSidebar
          comments={comments}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((prev) => !prev)}
          selectedCommentId={selectedCommentId}
          onSelectComment={handleSelectComment}
          onDeleteComment={handleDeleteComment}
          onStartCommenting={() => setIsCommentingMode(true)}
          isCommentingMode={isCommentingMode}
        />
      </div>

      {/* Modal de Primeiro Nome do Autor */}
      <AuthorModal
        isOpen={isAuthorModalOpen}
        onClose={() => {
          setIsAuthorModalOpen(false);
          setPendingClickPosition(null);
        }}
        onSuccess={handleAuthorSuccess}
      />
    </div>
  );
};
