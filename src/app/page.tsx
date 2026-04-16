'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Strategy } from '@/lib/types';
import { getAllStrategies, deleteStrategy, duplicateStrategy } from '@/lib/db';
import {
  Plus, Search, Copy, Trash2, Sparkles, FileText,
  Calendar, User, ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getAllStrategies();
      setStrategies(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteStrategy(id);
    setConfirmDelete(null);
    load();
  }

  async function handleDuplicate(s: Strategy) {
    const newId = await duplicateStrategy(s.id, `${s.name} (copia)`);
    load();
    // Optional: jump straight to the copy
    // router.push(`/strategy/${newId}`);
  }

  const filtered = strategies.filter(s => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.clientName.toLowerCase().includes(q) ||
      (s.subtitle || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
        style={{
          background: 'rgba(255,255,255,.96)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
              color: '#fff',
            }}
          >
            <Sparkles size={16} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--f)', fontWeight: 700, fontSize: 14 }}>
              Strategy Presenter
            </div>
            <div style={{ fontSize: 10, color: 'var(--t3)' }}>
              Presentazioni strategiche
            </div>
          </div>
        </div>

        <button className="btn-primary py-2 px-4" onClick={() => router.push('/new')}>
          <Plus size={16} /> Nuova Strategia
        </button>
      </header>

      <main className="pt-24 px-6 pb-12 max-w-7xl mx-auto">
        {/* Title + search */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1
              style={{
                fontFamily: 'var(--f)',
                fontWeight: 800,
                fontSize: 32,
                marginBottom: 6,
              }}
            >
              Le tue strategie
            </h1>
            <p style={{ fontSize: 14, color: 'var(--t2)' }}>
              {loading
                ? 'Caricamento...'
                : strategies.length === 0
                ? 'Non hai ancora creato nessuna strategia.'
                : `${strategies.length} strategia${strategies.length === 1 ? '' : 'e'} salvata${
                    strategies.length === 1 ? '' : 'e'
                  } localmente`}
            </p>
          </div>

          {strategies.length > 0 && (
            <div className="relative w-full md:w-80">
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--t3)',
                }}
              />
              <input
                className="form-input"
                style={{ paddingLeft: 40 }}
                placeholder="Cerca per nome, cliente..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div
              className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
            />
          </div>
        )}

        {/* Empty state */}
        {!loading && strategies.length === 0 && (
          <div
            className="flex flex-col items-center justify-center text-center py-20 px-6 rounded-2xl"
            style={{
              background: 'var(--card)',
              border: '1px dashed var(--border)',
            }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
              style={{
                background: 'linear-gradient(135deg, rgba(230,25,75,.1), rgba(139,92,246,.1))',
              }}
            >
              <FileText size={28} style={{ color: 'var(--accent)' }} />
            </div>
            <h2
              style={{
                fontFamily: 'var(--f)',
                fontWeight: 700,
                fontSize: 20,
                marginBottom: 8,
              }}
            >
              Inizia la tua prima strategia
            </h2>
            <p
              style={{
                fontSize: 14,
                color: 'var(--t2)',
                marginBottom: 24,
                maxWidth: 420,
              }}
            >
              Crea presentazioni professionali in pochi secondi: cover animata,
              buyer personas, SWOT, fasi operative e molto altro.
            </p>
            <button className="btn-primary" onClick={() => router.push('/new')}>
              <Sparkles size={16} /> Crea la prima strategia
            </button>
          </div>
        )}

        {/* No results state */}
        {!loading && strategies.length > 0 && filtered.length === 0 && (
          <div
            className="text-center py-16 rounded-2xl"
            style={{
              background: 'var(--card)',
              border: '1px dashed var(--border)',
            }}
          >
            <p style={{ fontFamily: 'var(--f)', fontSize: 14, color: 'var(--t2)' }}>
              Nessuna strategia trovata per &quot;{query}&quot;
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div className="dashboard-grid">
            {filtered.map(s => {
              const accent = s.accentColor || '#e6194b';
              const date = new Date(s.updatedAt).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
              return (
                <div
                  key={s.id}
                  className="strategy-card"
                  onClick={() => router.push(`/strategy/${s.id}`)}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 14,
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: 8,
                        background: `${accent}15`,
                        color: accent,
                        fontFamily: 'var(--f)',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        textTransform: 'uppercase',
                      }}
                    >
                      {s.subtitle || 'Strategia Social'}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--f)',
                      fontWeight: 700,
                      fontSize: 18,
                      marginBottom: 6,
                      lineHeight: 1.3,
                    }}
                  >
                    {s.name}
                  </h3>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      color: 'var(--t2)',
                      fontSize: 13,
                      marginBottom: 16,
                    }}
                  >
                    <User size={12} style={{ color: 'var(--t3)' }} />
                    {s.clientName || '—'}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 14,
                      borderTop: '1px solid var(--border)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: 'var(--t3)',
                        fontSize: 11,
                      }}
                    >
                      <Calendar size={11} />
                      {date}
                      <span style={{ margin: '0 4px' }}>·</span>
                      {s.sections.length} sezioni
                    </div>

                    <div
                      style={{ display: 'flex', gap: 4 }}
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        title="Duplica"
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition"
                        style={{ border: '1px solid var(--border)' }}
                        onClick={() => handleDuplicate(s)}
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        title="Elimina"
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition"
                        style={{ border: '1px solid var(--border)' }}
                        onClick={() => setConfirmDelete(s.id)}
                      >
                        <Trash2 size={12} style={{ color: 'var(--red)' }} />
                      </button>
                      <button
                        title="Apri"
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition"
                        style={{
                          border: `1px solid ${accent}40`,
                          background: `${accent}10`,
                          color: accent,
                        }}
                        onClick={() => router.push(`/strategy/${s.id}`)}
                      >
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: '0 20px 60px rgba(0,0,0,.15)',
              animation: 'riseIn .3s',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3
              style={{
                fontFamily: 'var(--f)',
                fontWeight: 700,
                fontSize: 18,
                marginBottom: 8,
              }}
            >
              Eliminare la strategia?
            </h3>
            <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 20 }}>
              Questa operazione è irreversibile. La strategia verrà rimossa
              definitivamente dal database locale.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="btn-secondary"
                onClick={() => setConfirmDelete(null)}
              >
                Annulla
              </button>
              <button
                className="btn-primary"
                style={{ background: 'var(--red)' }}
                onClick={() => handleDelete(confirmDelete)}
              >
                <Trash2 size={14} /> Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
