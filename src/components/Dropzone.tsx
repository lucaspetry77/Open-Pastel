import React, { useState, useRef } from 'react';
import { Upload, FileCode, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

interface DropzoneProps {
  onUploadHtml: (content: string) => Promise<void>;
  isUploading: boolean;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export const Dropzone: React.FC<DropzoneProps> = ({ onUploadHtml, isUploading }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndReadFile = (file: File) => {
    setError(null);

    // Validação de extensão
    if (!file.name.toLowerCase().endsWith('.html') && file.type !== 'text/html') {
      setError('Apenas arquivos .html são suportados.');
      return;
    }

    // Validação de tamanho (2MB)
    if (file.size > MAX_FILE_SIZE) {
      setError('O arquivo deve ter no máximo 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      if (content) {
        try {
          await onUploadHtml(content);
        } catch (err: any) {
          setError(err.message || 'Falha ao processar arquivo.');
        }
      }
    };
    reader.onerror = () => {
      setError('Erro ao ler o arquivo selecionado.');
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndReadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndReadFile(e.target.files[0]);
    }
  };

  // HTML demonstrativo rico para teste imediato
  const handleLoadDemo = () => {
    const demoHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Landing Page Demo — Pastel Feedback</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: linear-gradient(180deg, #090d16 0%, #111827 100%);
      color: #f8fafc;
      min-height: 1400px;
      padding: 0;
    }
    nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 64px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      background: rgba(17, 24, 39, 0.7);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .logo {
      font-size: 20px;
      font-weight: 800;
      background: linear-gradient(135deg, #a855f7, #6366f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero {
      text-align: center;
      padding: 100px 24px 60px;
      max-width: 900px;
      margin: 0 auto;
    }
    h1 {
      font-size: 56px;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.15;
      margin-bottom: 24px;
      background: linear-gradient(180deg, #ffffff 0%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p.lead {
      font-size: 20px;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 36px;
    }
    .cta-btn {
      display: inline-block;
      padding: 14px 32px;
      background: #6366f1;
      color: white;
      text-decoration: none;
      font-weight: 600;
      border-radius: 9999px;
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
      transition: transform 0.2s;
      cursor: pointer;
      border: none;
      font-size: 16px;
    }
    .cta-btn:hover {
      transform: scale(1.05);
      background: #4f46e5;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      max-width: 1100px;
      margin: 60px auto;
      padding: 0 24px;
    }
    .card {
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 32px;
      transition: transform 0.2s, border-color 0.2s;
    }
    .card:hover {
      transform: translateY(-4px);
      border-color: #6366f1;
    }
    .card h3 {
      font-size: 20px;
      margin-bottom: 12px;
      color: #f1f5f9;
    }
    .card p {
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.6;
    }
    .interactive-box {
      max-width: 600px;
      margin: 80px auto;
      padding: 32px;
      background: rgba(30, 41, 59, 0.6);
      border: 1px dashed rgba(255,255,255,0.2);
      border-radius: 16px;
      text-align: center;
    }
    #counter-display {
      font-size: 40px;
      font-weight: bold;
      color: #38bdf8;
      margin: 16px 0;
    }
    footer {
      text-align: center;
      padding: 60px 24px;
      color: #64748b;
      border-top: 1px solid rgba(255,255,255,0.08);
      margin-top: 120px;
    }
  </style>
</head>
<body>
  <nav>
    <div class="logo">✦ Acme Studio</div>
    <div><button class="cta-btn" style="padding: 8px 20px; font-size: 14px;">Entrar em Contato</button></div>
  </nav>

  <section class="hero">
    <h1>Design digital elevado ao próximo nível</h1>
    <p class="lead">Criamos interfaces fluidas, rápidas e cativantes para produtos inovadores em escala global.</p>
    <button class="cta-btn" onclick="alert('Botão clicado dentro do iframe!')">Conheça nossos cases</button>
  </section>

  <div class="grid">
    <div class="card">
      <h3>🚀 Performance Imbatível</h3>
      <p>Otimização de ponta a ponta com rendering instantâneo e pontuação máxima no Core Web Vitals.</p>
    </div>
    <div class="card">
      <h3>🎨 Visual System</h3>
      <p>Componentes consistentes, acessíveis e belos com suporte nativo a temas claros e escuros.</p>
    </div>
    <div class="card">
      <h3>⚡ Interatividade JS</h3>
      <p>Scripts inline seguros que rodam diretamente no ambiente isolado do sandbox.</p>
    </div>
  </div>

  <div class="interactive-box">
    <h3>Teste de Script Inline (JavaScript)</h3>
    <p style="color: #94a3b8; font-size: 14px; margin-top: 6px;">Clique no botão abaixo para testar o JavaScript do documento:</p>
    <div id="counter-display">0</div>
    <button class="cta-btn" id="btn-count" style="padding: 10px 24px;">Incrementar Contador</button>
  </div>

  <footer>
    <p>© 2026 Acme Studio. Todos os direitos reservados. Feito para testes de feedback visual.</p>
  </footer>

  <script>
    let count = 0;
    const btn = document.getElementById('btn-count');
    const display = document.getElementById('counter-display');
    if (btn && display) {
      btn.addEventListener('click', () => {
        count++;
        display.textContent = count;
      });
    }
  </script>
</body>
</html>`;

    onUploadHtml(demoHtml);
  };

  return (
    <div style={{ width: '100%', maxWidth: 640, margin: '0 auto' }}>
      <div
        className={`dropzone ${isDragActive ? 'active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".html,text/html"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: 'var(--accent-primary)',
          }}
        >
          {isUploading ? (
            <Loader2 size={32} className="pulse-indicator" />
          ) : (
            <Upload size={32} />
          )}
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
          {isUploading ? 'Processando e gerando board...' : 'Arraste seu arquivo .html aqui'}
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
          ou clique para selecionar um arquivo do seu computador
        </p>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 16,
            background: 'var(--bg-main)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: 12,
            color: 'var(--text-muted)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileCode size={14} /> HTML single-file
          </span>
          <span>•</span>
          <span>Máx. 2MB</span>
          <span>•</span>
          <span>CSS & JS inline</span>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginTop: 16,
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fb7185',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Botão de teste com HTML de exemplo */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button
          type="button"
          onClick={handleLoadDemo}
          disabled={isUploading}
          className="btn btn-secondary btn-sm"
          style={{ borderRadius: 'var(--radius-full)', padding: '8px 18px' }}
        >
          <Sparkles size={14} color="#818cf8" />
          <span>Testar com HTML de Demonstração</span>
        </button>
      </div>
    </div>
  );
};
