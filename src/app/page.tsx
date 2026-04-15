'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Strategy } from '@/lib/types';
import { getAllStrategies, deleteStrategy, duplicateStrategy } from '@/lib/db';
import {
  Plus, Search, Trash2, Copy, Eye, Calendar, Clock,
  LayoutDashboard, FileText, MoreVertical, X
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadStrategies();
  }, []);

  async function loadStrategies() {
    try {
      const data = await getAllStrategies();
      setStrategies(data);
    } catch (e) {
      console.error('Error loading strategies:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteStrategy(id);
    setDeleteConfirm(null);
    setMenuOpen(null);
    loadStrategies();
  }

  async function handleDuplicate(id: string, name: string) {
    const newId = await duplicateStrategy(id, `${name} (copia)`);
    setMenuOpen(null);
    loadStrategies();
  }

  const filtered = strategies.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.clientName.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  };

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
            style={{ background: 'var(--accent)' }}
          >
            <LayoutDashboard size={16} color="#fff" />
          </div>
          <span style={{ fontFamily: 'var(--f)', fontWeight: 800, fontSize: 16, color: 'var(--t1)' }}>
            Strategy Presenter
          </span>
        </div>
        <button className="btn-primary" onClick={() => router.push('/new')}>
          <Plus size={16} /> Nuova Strategia
        </button>
      </header>

      {/* Main content */}
      <main className="pt-20 px-6 pb-12 max-w-6xl mx-auto">
        {/* Hero */}
        <div className="mb-8 mt-4">
          <h1
            style={{ fontFamily: 'var(--f)', fontWeight: 800, fontSize: 'clamp(24px, 4vw, 36px)', color: 'var(--t1)', marginBottom: 8 }}
          >
            Le tue Strategie
          </h1>
          <p style={{ fontFamily: 'var(--fb)', fontSize: 15, color: 'var(--t2)' }}>
            Crea, modifica e presenta le tue strategie social media professionali.
          </p>
        </div>

        {/* Search + Stats */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--t3)' }} />
            <input
              type="text"
              placeholder="Cerca per nome o cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input pl-11"
            />
          </div>
          <div
            className="px-4 py-2 rounded-xl flex items-center gap-2"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', fontFamily: 'var(--f)', fontSize: 12, fontWeight: 600, color: 'var(--t2)' }}
          >
            <FileText size={14} /> {strategies.length} {strategies.length === 1 ? 'strategia' : 'strategie'}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(230,25,75,.06)' }}>
              <FileText size={28} style={{ color: 'var(--accent)' }} />
            </div>
            <h3 style={{ fontFamily: 'var(--f)', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>
              {search ? 'Nessun risultato' : 'Nessuna strategia ancora'}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 20 }}>
              {search ? 'Prova con altri termini di ricerca.' : 'Crea la tua prima presentazione strategica.'}
            </p>
            {!search && (
              <button className="btn-primary" onClick={() => router.push('/new')}>
                <Plus size={16} /> Crea la prima strategia
              </button>
            )}
          </div>
        ) : (
          <div className="dashboard-grid">
            {filtered.map(s => (
              <div key={s.id} className="strategy-card" onClick={() => router.push(`/strategy/${s.id}`)}>
                {/* Color strip */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                  style={{ background: `linear-gradient(90deg, ${s.accentColor || 'var(--accent)'}, #3b82f6, #8b5cf6)` }}
                />

                {/* Menu */}
                <div className="absolute top-3 right-3" onClick={e => e.stopPropagation()}>
                  <button
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition"
                    onClick={() => setMenuOpen(menuOpen === s.id ? null : s.id)}
                  >
                    <MoreVertical size={14} style={{ color: 'var(--t3)' }} />
                  </button>
                  {menuOpen === s.id && (
                    <div
                      className="absolute right-0 top-8 rounded-xl py-2 min-w-[160px] z-10"
                      style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,.12)' }}
                    >
                      <button
                        className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 transition"
                        style={{ fontFamily: 'var(--f)', fontSize: 12, fontWeight: 500 }}
                        onClick={() => router.push(`/strategy/${s.id}`)}
                      >
                        <Eye size={14} /> Visualizza
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 transition"
                        style={{ fontFamily: 'var(--f)', fontSize: 12, fontWeight: 500 }}
                        onClick={() => handleDuplicate(s.id, s.name)}
                      >
                        <Copy size={14} /> Duplica
                      </button>
                      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                      {deleteConfirm === s.id ? (
                        <div className="px-4 py-2">
                          <p style={{ fontSize: 11, color: 'var(--red)', fontWeight: 600, marginBottom: 6 }}>Confermi?</p>
                          <div className="flex gap-2">
                            <button className="btn-danger text-xs py-1 px-3" onClick={() => handleDelete(s.id)}>Elimina</button>
                            <button className="btn-secondary text-xs py-1 px-3" onClick={() => setDeleteConfirm(null)}>Annulla</button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-red-50 transition"
                          style={{ fontFamily: 'var(--f)', fontSize: 12, fontWeight: 500, color: 'var(--red)' }}
                          onClick={() => setDeleteConfirm(s.id)}
                        >
                          <Trash2 size={14} /> Elimina
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Card content */}
                <div
                  className="section-badge mb-3"
                  style={{
                    background: `${s.accentColor || 'var(--accent)'}10`,
                    border: `1px solid ${s.accentColor || 'var(--accent)'}20`,
                    color: s.accentColor || 'var(--accent)',
                  }}
                >
                  {s.clientName || 'Cliente'}
                </div>
                <h3 style={{ fontFamily: 'var(--f)', fontWeight: 700, fontSize: 16, marginBottom: 4, color: 'var(--t1)', lineHeight: 1.3 }}>
                  {s.name}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 16 }}>
                  {s.subtitle || 'Strategia Social Media'}
                </p>
                <div className="flex items-center gap-4" style={{ fontSize: 11, color: 'var(--t3)' }}>
                  <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(s.createdAt)}</span>
                  <span className="flex items-center gap-1"><Clock size={12} />{formatTime(s.updatedAt)}</span>
                  <span className="flex items-center gap-1"><FileText size={12} />{s.sections.length} sezioni</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Click outside to close menus */}
      {menuOpen && <div className="fixed inset-0 z-0" onClick={() => { setMenuOpen(null); setDeleteConfirm(null); }} />}
    </div>
  );
}
