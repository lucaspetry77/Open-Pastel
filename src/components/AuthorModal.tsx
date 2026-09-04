import React, { useState } from 'react';
import { User, X, Check } from 'lucide-react';
import { setStoredAuthorName } from '../services/boardService';

interface AuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (name: string) => void;
}

export const AuthorModal: React.FC<AuthorModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Por favor, informe seu nome para comentar.');
      return;
    }
    if (trimmed.length < 2) {
      setError('O nome deve ter pelo menos 2 caracteres.');
      return;
    }

    setStoredAuthorName(trimmed);
    onSuccess(trimmed);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="btn btn-ghost btn-sm"
          style={{ position: 'absolute', top: 16, right: 16, padding: 6 }}
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
            }}
          >
            <User size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Como devemos te chamar?</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Identifique seus comentários neste board. Sem senha necessária!
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="authorNameInput"
              style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}
            >
              Seu nome ou apelido
            </label>
            <input
              id="authorNameInput"
              type="text"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ex: Lucas Petry, Designer, etc."
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: 14,
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-main)',
                border: `1px solid ${error ? 'var(--accent-rose)' : 'var(--border-strong)'}`,
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            {error && (
              <p style={{ fontSize: 12, color: 'var(--accent-rose)', marginTop: 6 }}>
                {error}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              Continuar e Comentar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
