'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Strategy, StrategySection, SECTION_TYPE_LABELS } from '@/lib/types';
import { getStrategy, saveStrategy } from '@/lib/db';
import {
  ArrowLeft, Edit3, Lock, Download, Save, ChevronLeft,
  ChevronRight, Maximize2, Minimize2, FileText, Printer
} from 'lucide-react';

export default function StrategyViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadStrategy();
  }, [id]);

  async function loadStrategy() {
    try {
      const data = await getStrategy(id);
      if (data) setStrategy(data);
      else router.push('/');
    } catch (e) {
      console.error(e);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (editingSection) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') navigate(1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') navigate(-1);
      if (e.key === 'Escape' && fullscreen) setFullscreen(false);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentSlide, strategy, fullscreen, editingSection]);

  // Touch navigation
  useEffect(() => {
    let sx = 0;
    function onStart(e: TouchEvent) { sx = e.touches[0].clientX; }
    function onEnd(e: TouchEvent) {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) navigate(dx < 0 ? 1 : -1);
    }
    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchend', onEnd);
    };
  }, [currentSlide, strategy]);

  function navigate(dir: number) {
    if (!strategy) return;
    const total = getAllSlides().length;
    setCurrentSlide(prev => Math.max(0, Math.min(prev + dir, total - 1)));
  }

  function getAllSlides(): (StrategySection | { type: 'custom-html'; id: string; title: string; content: string })[] {
    if (!strategy) return [];
    const slides: any[] = [...strategy.sections];
    // Insert custom HTML files at the end before contacts
    if (strategy.customHtmlFiles) {
      const contactIdx = slides.findIndex(s => s.type === 'contacts');
      const insertIdx = contactIdx >= 0 ? contactIdx : slides.length;
      strategy.customHtmlFiles.forEach((f, i) => {
        slides.splice(insertIdx + i, 0, {
          type: 'custom-html',
          id: f.id,
          title: f.name.replace('.html', ''),
          content: f.htmlContent,
        });
      });
    }
    return slides;
  }

  function goToSection(sectionType: string) {
    const slides = getAllSlides();
    const idx = slides.findIndex(s => s.type === sectionType);
    if (idx >= 0) setCurrentSlide(idx);
  }

  async function handleSave() {
    if (!strategy) return;
    setSaving(true);
    await saveStrategy(strategy);
    setTimeout(() => setSaving(false), 800);
  }

  function openEditSection(section: StrategySection) {
    setEditingSection(section.id);
    setEditContent(section.content);
    setEditTitle(section.title);
  }

  function saveEditSection() {
    if (!strategy || !editingSection) return;
    const updated = {
      ...strategy,
      sections: strategy.sections.map(s =>
        s.id === editingSection ? { ...s, content: editContent, title: editTitle } : s
      ),
    };
    setStrategy(updated);
    saveStrategy(updated);
    setEditingSection(null);
  }

  async function exportPdf() {
    // Dynamic import for client-side only
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    const slides = getAllSlides();
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1280, 720] });

    const prevSlide = currentSlide;

    for (let i = 0; i < slides.length; i++) {
      setCurrentSlide(i);
      await new Promise(r => setTimeout(r, 600));

      const slideEl = document.querySelector('.slide.active') as HTMLElement;
      if (!slideEl) continue;

      const canvas = await html2canvas(slideEl, {
        scale: 2,
        backgroundColor: '#FAF8F5',
        width: slideEl.scrollWidth,
        height: slideEl.scrollHeight,
        windowWidth: 1280,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, 0, 1280, 720);
    }

    pdf.save(`${strategy?.name || 'strategy'}.pdf`);
    setCurrentSlide(prevSlide);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!strategy) return null;

  const slides = getAllSlides();
  const total = slides.length;
  const progress = ((currentSlide + 1) / total) * 100;
  const current = slides[currentSlide];

  // Unique section types for dock
  const sectionTypes = [...new Set(strategy.sections.map(s => s.type))];

  return (
    <div className={`min-h-screen ${fullscreen ? 'fixed inset-0 z-[9999]' : ''}`} style={{ background: 'var(--bg)' }} ref={containerRef}>
      {/* Top bar */}
      <header
        className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between px-4 py-2 no-print"
        style={{ background: 'rgba(255,255,255,.96)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <button className="btn-secondary py-1.5 px-2.5" onClick={() => router.push('/')}>
            <ArrowLeft size={14} />
          </button>
          <div>
            <span style={{ fontFamily: 'var(--f)', fontWeight: 700, fontSize: 13, display: 'block' }}>{strategy.name}</span>
            <span style={{ fontSize: 10, color: 'var(--t3)' }}>{strategy.clientName}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`btn-secondary py-1.5 px-3 text-xs ${editMode ? 'border-blue-400 text-blue-600 bg-blue-50' : ''}`}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? <><Lock size={13} /> Blocca</> : <><Edit3 size={13} /> Modifica</>}
          </button>
          {editMode && (
            <button className="btn-primary py-1.5 px-3 text-xs" onClick={handleSave}>
              <Save size={13} /> {saving ? 'Salvato!' : 'Salva'}
            </button>
          )}
          <button className="btn-secondary py-1.5 px-3 text-xs" onClick={exportPdf}>
            <Download size={13} /> PDF
          </button>
          <button className="btn-secondary py-1.5 px-3 text-xs" onClick={() => window.print()}>
            <Printer size={13} />
          </button>
          <button className="btn-secondary py-1.5 px-2.5" onClick={() => setFullscreen(!fullscreen)}>
            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="progress-bar no-print" style={{ width: `${progress}%` }} />

      {/* Slides */}
      <div className="presentation-wrapper">
        {slides.map((s, i) => (
          <div key={s.id} className={`slide ${i === currentSlide ? 'active' : ''}`}>
            <div className="slide-inner">
              {s.type === 'custom-html' ? (
                <div className="animate-in" dangerouslySetInnerHTML={{ __html: s.content }} />
              ) : s.type === 'cover' ? (
                <CoverSlide strategy={strategy} section={s as StrategySection} />
              ) : s.type === 'index' ? (
                <IndexSlide strategy={strategy} goToSection={goToSection} />
              ) : (
                <StandardSlide
                  section={s as StrategySection}
                  editMode={editMode}
                  onEdit={() => openEditSection(s as StrategySection)}
                  accentColor={strategy.accentColor}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[200] no-print"
        style={{ background: 'rgba(255,255,255,.94)', backdropFilter: 'blur(16px)', borderTop: '1px solid var(--border)' }}
      >
        {/* Dock */}
        <div className="nav-dock">
          {sectionTypes.map(type => (
            <button
              key={type}
              className={`dock-item ${current && 'type' in current && current.type === type ? 'active' : ''}`}
              onClick={() => goToSection(type)}
            >
              {SECTION_TYPE_LABELS[type] || type}
            </button>
          ))}
        </div>
        {/* Nav buttons */}
        <div className="flex items-center justify-center gap-4 py-2 px-5">
          <button className="btn-secondary py-1.5 px-4 text-xs" onClick={() => navigate(-1)} style={{ opacity: currentSlide === 0 ? 0.3 : 1 }}>
            <ChevronLeft size={14} /> Precedente
          </button>
          <span style={{ fontFamily: 'var(--f)', fontSize: 11, color: 'var(--t3)', minWidth: 60, textAlign: 'center' }}>
            {currentSlide + 1} / {total}
          </span>
          <button className="btn-primary py-1.5 px-4 text-xs" onClick={() => navigate(1)} style={{ opacity: currentSlide === total - 1 ? 0.3 : 1 }}>
            Successiva <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Edit modal */}
      {editingSection && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)' }}>
          <div
            className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl p-6"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,.15)', animation: 'riseIn .3s' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontFamily: 'var(--f)', fontWeight: 700, fontSize: 16 }}>Modifica Sezione</h3>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 transition"
                style={{ border: '1px solid var(--border)' }}
                onClick={() => setEditingSection(null)}
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <label style={{ fontFamily: 'var(--f)', fontSize: 11, fontWeight: 600, color: 'var(--t3)', display: 'block', marginBottom: 6 }}>TITOLO</label>
              <input className="form-input" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
            </div>
            <div className="mb-4">
              <label style={{ fontFamily: 'var(--f)', fontSize: 11, fontWeight: 600, color: 'var(--t3)', display: 'block', marginBottom: 6 }}>CONTENUTO HTML</label>
              <textarea
                className="form-textarea font-mono text-xs"
                style={{ minHeight: 400 }}
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button className="btn-secondary" onClick={() => setEditingSection(null)}>Annulla</button>
              <button className="btn-primary" onClick={saveEditSection}><Save size={14} /> Salva modifiche</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================
   SLIDE COMPONENTS
   ============================================ */

function CoverSlide({ strategy, section }: { strategy: Strategy; section: StrategySection }) {
  const accent = strategy.accentColor || '#e6194b';
  return (
    <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: 'calc(100vh - 200px)', position: 'relative' }}>
      {/* Animated background paths */}
      <div className="cover-paths">
        <svg viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
          <path d="M0,400 Q300,100 600,400 T1200,400" strokeWidth="1" />
          <path d="M0,300 Q400,600 800,300 T1200,500" strokeWidth="1" />
          <path d="M0,500 Q200,200 500,500 T1000,300" strokeWidth="1" />
          <path d="M100,600 Q350,100 700,500 T1100,200" strokeWidth="1" />
        </svg>
      </div>

      <div className="animate-in" style={{ animationDelay: '.1s' }}>
        <div
          className="section-badge mb-4"
          style={{ background: `${accent}10`, border: `1px solid ${accent}25`, color: accent }}
        >
          {strategy.subtitle || 'Strategia Social Media'}
        </div>
      </div>
      <h1 className="animate-in" style={{
        fontFamily: 'var(--f)', fontWeight: 800,
        fontSize: 'clamp(28px, 5vw, 52px)', lineHeight: 1.1,
        marginBottom: 12, animationDelay: '.2s', maxWidth: 700
      }}>
        {strategy.name}
      </h1>
      <p className="animate-in" style={{ fontSize: 18, color: 'var(--t2)', animationDelay: '.3s', marginBottom: 20 }}>
        {strategy.clientName}
      </p>
      <div className="animate-in flex items-center gap-3" style={{ animationDelay: '.4s' }}>
        <div className="w-12 h-[2px] rounded" style={{ background: accent }} />
        <span style={{ fontFamily: 'var(--f)', fontSize: 11, fontWeight: 600, color: 'var(--t3)', letterSpacing: 1 }}>
          {new Date(strategy.createdAt).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }).toUpperCase()}
        </span>
        <div className="w-12 h-[2px] rounded" style={{ background: accent }} />
      </div>
    </div>
  );
}

function IndexSlide({ strategy, goToSection }: { strategy: Strategy; goToSection: (t: string) => void }) {
  const sections = strategy.sections.filter(s => s.type !== 'cover' && s.type !== 'index');
  return (
    <>
      <div className="section-line animate-in" style={{ background: 'linear-gradient(90deg, var(--edu), var(--accent))' }} />
      <div className="section-badge animate-in" style={{ background: 'rgba(27,58,123,.06)', border: '1px solid rgba(27,58,123,.12)', color: 'var(--edu)' }}>
        Sommario
      </div>
      <h2 className="slide-title animate-in">Indice della Presentazione</h2>
      <div className="grid-2 animate-in" style={{ marginTop: 16 }}>
        {sections.map((s, i) => (
          <button
            key={s.id}
            className="content-card flex items-center gap-3 text-left cursor-pointer hover:border-[var(--accent)] transition"
            onClick={() => goToSection(s.type)}
            style={{ padding: '12px 16px' }}
          >
            <span style={{ fontFamily: 'var(--f)', fontSize: 16, fontWeight: 800, minWidth: 28, color: s.color }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <span style={{ fontFamily: 'var(--f)', fontSize: 12, fontWeight: 600 }}>{s.title}</span>
              <span style={{ fontSize: 10, color: 'var(--t3)', display: 'block' }}>{s.badgeLabel}</span>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

function StandardSlide({ section, editMode, onEdit, accentColor }: {
  section: StrategySection;
  editMode: boolean;
  onEdit: () => void;
  accentColor?: string;
}) {
  const color = section.color || accentColor || 'var(--accent)';
  return (
    <>
      <div className="section-line animate-in" style={{ background: `linear-gradient(90deg, ${color}, #3b82f6)` }} />
      <div
        className="section-badge animate-in"
        style={{ background: `${color}10`, border: `1px solid ${color}20`, color }}
      >
        {section.badgeLabel}
      </div>
      <div className="flex items-center justify-between w-full max-w-[960px] animate-in">
        <h2 className="slide-title">{section.title}</h2>
        {editMode && (
          <button className="btn-secondary py-1 px-3 text-xs" onClick={onEdit}>
            <Edit3 size={12} /> Modifica
          </button>
        )}
      </div>
      {section.subtitle && (
        <p className="animate-in" style={{ fontFamily: 'var(--fb)', fontSize: 14, color: 'var(--t2)', lineHeight: 1.6, maxWidth: 800, marginBottom: 16 }}>
          {section.subtitle}
        </p>
      )}
      <div
        className="w-full max-w-[960px] animate-in"
        dangerouslySetInnerHTML={{ __html: section.content }}
      />
    </>
  );
}
