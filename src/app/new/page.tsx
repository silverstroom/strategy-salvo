'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Strategy, SECTION_TEMPLATES, StrategySection, CustomHtmlFile } from '@/lib/types';
import { saveStrategy } from '@/lib/db';
import {
  ArrowLeft, Upload, FileCode, Plus, X, Sparkles,
  CheckCircle2, Loader2, ChevronDown, ChevronUp, Trash2
} from 'lucide-react';

const GENERATION_STEPS = [
  { label: 'Analisi del testo fornito', icon: '📝' },
  { label: 'Strutturazione delle sezioni', icon: '🏗️' },
  { label: 'Creazione della Cover', icon: '🎨' },
  { label: 'Generazione Identità del Brand', icon: '🔍' },
  { label: 'Analisi Social & Competitor', icon: '📊' },
  { label: 'Definizione Buyer Personas', icon: '👥' },
  { label: 'Elaborazione SWOT', icon: '⚡' },
  { label: 'Composizione contenuti visivi', icon: '🖼️' },
  { label: 'Creazione fasi operative', icon: '📋' },
  { label: 'Integrazione file HTML custom', icon: '🔗' },
  { label: 'Finalizzazione presentazione', icon: '✅' },
];

export default function NewStrategyPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'form' | 'generating' | 'done'>('form');
  const [currentGenStep, setCurrentGenStep] = useState(0);
  const [generatedId, setGeneratedId] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [accentColor, setAccentColor] = useState('#e6194b');
  const [mainText, setMainText] = useState('');
  const [htmlFiles, setHtmlFiles] = useState<CustomHtmlFile[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [sectionTexts, setSectionTexts] = useState<Record<string, string>>({});

  function toggleSection(type: string) {
    const next = new Set(expandedSections);
    if (next.has(type)) next.delete(type); else next.add(type);
    setExpandedSections(next);
  }

  function updateSectionText(type: string, value: string) {
    setSectionTexts(prev => ({ ...prev, [type]: value }));
  }

  async function handleHtmlUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const text = await file.text();
      setHtmlFiles(prev => [...prev, {
        id: crypto.randomUUID(),
        name: file.name,
        htmlContent: text,
      }]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeHtmlFile(id: string) {
    setHtmlFiles(prev => prev.filter(f => f.id !== id));
  }

  async function handleGenerate() {
    if (!name.trim()) return;

    setStep('generating');

    const strategyId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Simulate generation phases
    for (let i = 0; i < GENERATION_STEPS.length; i++) {
      setCurrentGenStep(i);
      await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
    }

    // Build sections from template + user text
    const sections: StrategySection[] = SECTION_TEMPLATES.map(tmpl => {
      const sectionContent = sectionTexts[tmpl.type] || '';
      const content = buildSectionContent(tmpl.type, sectionContent, mainText, clientName, name);
      return {
        id: crypto.randomUUID(),
        ...tmpl,
        content,
      };
    });

    const strategy: Strategy = {
      id: strategyId,
      name,
      clientName,
      subtitle: subtitle || 'Strategia Social Media',
      createdAt: now,
      updatedAt: now,
      sections,
      customHtmlFiles: htmlFiles,
      accentColor,
    };

    await saveStrategy(strategy);
    setGeneratedId(strategyId);
    setStep('done');
  }

  if (step === 'generating' || step === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h2 style={{ fontFamily: 'var(--f)', fontWeight: 800, fontSize: 24, marginBottom: 6 }}>
              {step === 'done' ? 'Strategia Creata!' : 'Generazione in corso...'}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--t2)' }}>
              {step === 'done' ? `"${name}" è pronta per la visualizzazione.` : 'Stiamo costruendo la tua presentazione.'}
            </p>
          </div>

          <div className="space-y-2 mb-8">
            {GENERATION_STEPS.map((gs, i) => {
              const isDone = step === 'done' || i < currentGenStep;
              const isActive = step !== 'done' && i === currentGenStep;
              return (
                <div key={i} className={`loading-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                  <div className="step-dot" />
                  <span style={{ fontFamily: 'var(--f)', fontSize: 13, fontWeight: 500, flex: 1, color: isDone ? 'var(--green)' : isActive ? 'var(--t1)' : 'var(--t3)' }}>
                    {gs.icon} {gs.label}
                  </span>
                  {isDone && <CheckCircle2 size={16} style={{ color: 'var(--green)' }} />}
                  {isActive && <Loader2 size={16} className="animate-spin" style={{ color: 'var(--accent)' }} />}
                </div>
              );
            })}
          </div>

          {step === 'done' && (
            <div className="flex gap-3 justify-center">
              <button className="btn-primary" onClick={() => router.push(`/strategy/${generatedId}`)}>
                <Sparkles size={16} /> Apri Presentazione
              </button>
              <button className="btn-secondary" onClick={() => router.push('/')}>
                Torna alla Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center gap-4 px-6 py-3"
        style={{ background: 'rgba(255,255,255,.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)' }}
      >
        <button className="btn-secondary py-2 px-3" onClick={() => router.push('/')}>
          <ArrowLeft size={16} />
        </button>
        <span style={{ fontFamily: 'var(--f)', fontWeight: 700, fontSize: 14 }}>Nuova Strategia</span>
      </header>

      <main className="pt-20 px-6 pb-12 max-w-4xl mx-auto">
        {/* Basic Info */}
        <div className="form-section">
          <h2 style={{ fontFamily: 'var(--f)', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Informazioni Generali</h2>
          <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 20 }}>Dati principali della strategia</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label style={{ fontFamily: 'var(--f)', fontSize: 11, fontWeight: 600, color: 'var(--t3)', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
                NOME STRATEGIA *
              </label>
              <input className="form-input" placeholder="Es. Strategia Social Media 2026" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--f)', fontSize: 11, fontWeight: 600, color: 'var(--t3)', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
                NOME CLIENTE *
              </label>
              <input className="form-input" placeholder="Es. EduNews24" value={clientName} onChange={e => setClientName(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label style={{ fontFamily: 'var(--f)', fontSize: 11, fontWeight: 600, color: 'var(--t3)', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
                SOTTOTITOLO
              </label>
              <input className="form-input" placeholder="Es. Piano Editoriale Q1 2026" value={subtitle} onChange={e => setSubtitle(e.target.value)} />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--f)', fontSize: 11, fontWeight: 600, color: 'var(--t3)', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
                COLORE PRINCIPALE
              </label>
              <div className="flex items-center gap-3">
                <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                <input className="form-input" value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ fontFamily: 'monospace' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Main text */}
        <div className="form-section">
          <h2 style={{ fontFamily: 'var(--f)', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Testo della Strategia</h2>
          <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 20 }}>
            Inserisci il testo completo della strategia. Verrà distribuito automaticamente nelle sezioni standard.
          </p>
          <textarea
            className="form-textarea"
            style={{ minHeight: 300 }}
            placeholder="Incolla qui il testo completo della tua strategia...&#10;&#10;Il contenuto verrà analizzato e distribuito nelle diverse sezioni della presentazione (Identità, Analisi Social, Personas, Competitor, SWOT, ecc.)."
            value={mainText}
            onChange={e => setMainText(e.target.value)}
          />
        </div>

        {/* Per-section text (accordion) */}
        <div className="form-section">
          <h2 style={{ fontFamily: 'var(--f)', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Contenuto per Sezione</h2>
          <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 20 }}>
            Opzionale: inserisci testo specifico per ogni sezione. Se lasciato vuoto, verrà usato il testo principale.
          </p>

          {SECTION_TEMPLATES.filter(t => t.type !== 'cover' && t.type !== 'index').map(tmpl => (
            <div key={tmpl.type} className="mb-2">
              <button
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition hover:bg-gray-50"
                style={{ background: expandedSections.has(tmpl.type) ? 'rgba(230,25,75,.03)' : 'transparent', border: '1px solid var(--border)' }}
                onClick={() => toggleSection(tmpl.type)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: tmpl.color }} />
                  <span style={{ fontFamily: 'var(--f)', fontSize: 13, fontWeight: 600 }}>{tmpl.badgeLabel} — {tmpl.title}</span>
                  {sectionTexts[tmpl.type] && (
                    <span className="badge-ok text-xs">Compilato</span>
                  )}
                </div>
                {expandedSections.has(tmpl.type) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSections.has(tmpl.type) && (
                <div className="px-4 py-3">
                  <textarea
                    className="form-textarea"
                    style={{ minHeight: 150 }}
                    placeholder={`Inserisci il contenuto per "${tmpl.title}"...`}
                    value={sectionTexts[tmpl.type] || ''}
                    onChange={e => updateSectionText(tmpl.type, e.target.value)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* HTML file uploads */}
        <div className="form-section">
          <h2 style={{ fontFamily: 'var(--f)', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>File HTML Aggiuntivi</h2>
          <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 20 }}>
            Carica file HTML separati che verranno integrati nella presentazione come slide aggiuntive.
          </p>

          <input ref={fileInputRef} type="file" accept=".html,.htm" multiple className="hidden" onChange={handleHtmlUpload} />

          {htmlFiles.length > 0 && (
            <div className="space-y-2 mb-4">
              {htmlFiles.map(f => (
                <div
                  key={f.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-3">
                    <FileCode size={18} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontFamily: 'var(--f)', fontSize: 13, fontWeight: 500 }}>{f.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--t3)' }}>
                      {(f.htmlContent.length / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <button onClick={() => removeHtmlFile(f.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition">
                    <Trash2 size={14} style={{ color: 'var(--red)' }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} /> Carica file HTML
          </button>
        </div>

        {/* Generate button */}
        <div className="flex items-center justify-between mt-8">
          <button className="btn-secondary" onClick={() => router.push('/')}>
            <ArrowLeft size={16} /> Annulla
          </button>
          <button
            className="btn-primary"
            onClick={handleGenerate}
            style={{ opacity: name.trim() ? 1 : 0.5, pointerEvents: name.trim() ? 'auto' : 'none', fontSize: 15, padding: '14px 32px' }}
          >
            <Sparkles size={18} /> Genera Presentazione
          </button>
        </div>
      </main>
    </div>
  );
}

/** Build section HTML content from user input */
function buildSectionContent(
  type: string,
  sectionText: string,
  mainText: string,
  clientName: string,
  strategyName: string
): string {
  const text = sectionText || mainText || '';
  const paragraphs = text.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('\n');

  switch (type) {
    case 'cover':
      return `<div style="text-align:center;">
        <h1 style="font-family:var(--f);font-weight:800;font-size:clamp(28px,5vw,48px);margin-bottom:12px;">${strategyName}</h1>
        <p style="font-size:16px;color:var(--t2);">${clientName}</p>
      </div>`;

    case 'index':
      return ''; // Auto-generated from sections

    case 'swot':
      return sectionText ? buildSwotContent(sectionText) : getPlaceholderSwot();

    case 'personas':
      return sectionText ? buildPersonasContent(sectionText) : getPlaceholderPersonas(clientName);

    case 'competitors':
      return sectionText ? buildCompetitorContent(sectionText) : getPlaceholderCompetitor();

    default:
      return sectionText
        ? `<div class="content-card">${paragraphs}</div>`
        : `<div class="content-card"><p style="color:var(--t3);font-style:italic;">Contenuto da inserire per questa sezione. Clicca "Modifica" per aggiungere il testo.</p></div>`;
  }
}

function buildSwotContent(text: string): string {
  return `<div class="swot-grid">
    <div class="swot-card" style="border-top:4px solid var(--green);">
      <h4 style="color:var(--green);">💪 Punti di Forza</h4>
      <p style="font-size:12px;color:var(--t2);line-height:1.6;">${text}</p>
    </div>
    <div class="swot-card" style="border-top:4px solid var(--amber);">
      <h4 style="color:var(--amber);">⚠️ Debolezze</h4>
      <p style="font-size:12px;color:var(--t2);line-height:1.6;">Da definire</p>
    </div>
    <div class="swot-card" style="border-top:4px solid #3b82f6;">
      <h4 style="color:#3b82f6;">🚀 Opportunità</h4>
      <p style="font-size:12px;color:var(--t2);line-height:1.6;">Da definire</p>
    </div>
    <div class="swot-card" style="border-top:4px solid var(--red);">
      <h4 style="color:var(--red);">🛑 Minacce</h4>
      <p style="font-size:12px;color:var(--t2);line-height:1.6;">Da definire</p>
    </div>
  </div>`;
}

function getPlaceholderSwot(): string {
  return buildSwotContent('Da definire');
}

function buildPersonasContent(text: string): string {
  return `<div class="grid-3"><div class="persona-card" style="border-top:4px solid #2D6A4F;">
    <h4 style="color:#2D6A4F;">👤 Persona 1</h4>
    <p style="font-size:12px;color:var(--t2);line-height:1.6;">${text}</p>
  </div></div>`;
}

function getPlaceholderPersonas(client: string): string {
  return `<div class="grid-3">
    <div class="persona-card" style="border-top:4px solid #2D6A4F;">
      <h4 style="color:#2D6A4F;">👤 Persona Primaria</h4>
      <p style="font-size:12px;color:var(--t2);line-height:1.6;font-style:italic;">Definisci il target principale di ${client || 'questo progetto'}.</p>
    </div>
    <div class="persona-card" style="border-top:4px solid var(--edu);">
      <h4 style="color:var(--edu);">👤 Persona Secondaria</h4>
      <p style="font-size:12px;color:var(--t2);line-height:1.6;font-style:italic;">Definisci il secondo target.</p>
    </div>
    <div class="persona-card" style="border-top:4px solid #EA580C;">
      <h4 style="color:#EA580C;">👤 Persona Terziaria</h4>
      <p style="font-size:12px;color:var(--t2);line-height:1.6;font-style:italic;">Definisci il terzo target.</p>
    </div>
  </div>`;
}

function buildCompetitorContent(text: string): string {
  return `<div class="content-card"><p>${text}</p></div>`;
}

function getPlaceholderCompetitor(): string {
  return `<div style="overflow-x:auto;"><table class="strategy-table">
    <tr><th style="background:#7C3AED;">Competitor</th><th style="background:#7C3AED;">Punti di Forza</th><th style="background:#7C3AED;">Differenziale</th></tr>
    <tr><td>Da definire</td><td style="color:var(--t3);font-style:italic;">—</td><td style="color:var(--t3);font-style:italic;">—</td></tr>
  </table></div>`;
}
