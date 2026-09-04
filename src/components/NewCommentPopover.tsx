import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquarePlus } from 'lucide-react';
import { NewPinPosition } from '../types';

interface NewCommentPopoverProps {
  position: NewPinPosition;
  authorName: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (text: string) => void;
}

export const NewCommentPopover: React.FC<NewCommentPopoverProps> = ({
  position,
  authorName,
  isSubmitting,
  onCancel,
  onSubmit,
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleSend = () => {
    if (!text.trim() || isSubmitting) return;
    onSubmit(text);
  };

  // Previne que o popover saia pela borda direita da tela se pos_x > 70%
  const isRightSide = position.x > 68;
  const isBottom = position.y > 85;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        zIndex: 100,
        pointerEvents: 'auto',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Pin pulsante no ponto exato */}
      <div
        className="pin-marker active"
        style={{ position: 'absolute', left: 0, top: 0 }}
      >
        <div className="pin-bubble pulse-indicator">
          <span className="pin-bubble-inner">+</span>
        </div>
      </div>

      {/* Caixa de diálogo do comentário */}
      <div
        style={{
          position: 'absolute',
          top: isBottom ? -220 : 16,
          left: isRightSide ? -280 : 16,
          width: 300,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.7)',
          padding: '16px',
          animation: 'slideUp 0.15s ease-out',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MessageSquarePlus size={15} color="var(--accent-primary)" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Comentando como <strong style={{ color: 'var(--text-primary)' }}>{authorName}</strong>
            </span>
          </div>
          <button
            onClick={onCancel}
            className="btn btn-ghost btn-sm"
            style={{ padding: 3 }}
            title="Cancelar (Esc)"
          >
            <X size={14} />
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="O que você gostaria de comentar neste ponto?"
          rows={3}
          style={{
            width: '100%',
            background: 'var(--bg-main)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px',
            fontSize: 13,
            color: 'var(--text-primary)',
            resize: 'none',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 10,
          }}
        >
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Ctrl/⌘ + Enter
          </span>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary btn-sm"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={!text.trim() || isSubmitting}
              className="btn btn-primary btn-sm"
            >
              <Send size={13} />
              {isSubmitting ? 'Salvando...' : 'Comentar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
