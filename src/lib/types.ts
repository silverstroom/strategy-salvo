export interface StrategySection {
  id: string;
  type: SectionType;
  title: string;
  subtitle?: string;
  content: string; // Rich text / HTML content
  color: string; // Accent color for this section
  badgeLabel: string;
  order: number;
}

export type SectionType =
  | 'cover'
  | 'index'
  | 'identity'
  | 'social-analysis'
  | 'personas'
  | 'competitors'
  | 'synthesis'
  | 'swot'
  | 'logo'
  | 'palette'
  | 'font'
  | 'reel-proposals'
  | 'post-proposals'
  | 'mockup'
  | 'social-posts'
  | 'phases'
  | 'contacts';

export interface Strategy {
  id: string;
  name: string;
  clientName: string;
  subtitle: string;
  createdAt: string;
  updatedAt: string;
  sections: StrategySection[];
  customHtmlFiles?: CustomHtmlFile[];
  coverColor?: string;
  accentColor?: string;
}

export interface CustomHtmlFile {
  id: string;
  name: string;
  htmlContent: string;
  insertAfterSection?: string;
}

export const SECTION_TEMPLATES: Omit<StrategySection, 'id' | 'content'>[] = [
  { type: 'cover', title: '', subtitle: '', color: '#e6194b', badgeLabel: 'Strategia Social Media', order: 0 },
  { type: 'index', title: 'Sommario', subtitle: '', color: '#1B3A7B', badgeLabel: 'Sommario', order: 1 },
  { type: 'identity', title: 'Identità del Brand', subtitle: '', color: '#1B3A7B', badgeLabel: '01 — Identità', order: 2 },
  { type: 'social-analysis', title: 'Analisi Social', subtitle: '', color: '#1877F2', badgeLabel: '02 — Analisi Social', order: 3 },
  { type: 'personas', title: 'Buyer Personas', subtitle: '', color: '#EA580C', badgeLabel: '03 — Buyer Personas', order: 4 },
  { type: 'competitors', title: 'Analisi Competitor', subtitle: '', color: '#7C3AED', badgeLabel: '04 — Competitor', order: 5 },
  { type: 'synthesis', title: 'Sintesi Strategica', subtitle: '', color: '#0891B2', badgeLabel: '05 — Sintesi', order: 6 },
  { type: 'swot', title: 'Analisi SWOT', subtitle: '', color: '#16a34a', badgeLabel: '06 — Analisi SWOT', order: 7 },
  { type: 'logo', title: 'Utilizzo del Logo', subtitle: '', color: '#1B3A7B', badgeLabel: '07 — Logo', order: 8 },
  { type: 'palette', title: 'Palette Colori', subtitle: '', color: '#B45309', badgeLabel: '08 — Palette', order: 9 },
  { type: 'font', title: 'Tipografia', subtitle: '', color: '#555', badgeLabel: '09 — Font', order: 10 },
  { type: 'reel-proposals', title: 'Proposte Reel', subtitle: '', color: '#dc2626', badgeLabel: '10 — Proposte Reel', order: 11 },
  { type: 'post-proposals', title: 'Proposte Post', subtitle: '', color: '#d97706', badgeLabel: '11 — Proposte Post', order: 12 },
  { type: 'mockup', title: 'Mockup Visivi', subtitle: '', color: '#E1306C', badgeLabel: '12 — Mockup', order: 13 },
  { type: 'social-posts', title: 'Contenuti Social', subtitle: '', color: '#8b5cf6', badgeLabel: '13 — Post Social', order: 14 },
  { type: 'phases', title: 'Fasi Operative', subtitle: '', color: '#0A66C2', badgeLabel: '14 — Fasi Operative', order: 15 },
  { type: 'contacts', title: 'Contatti', subtitle: '', color: '#e6194b', badgeLabel: 'Contatti', order: 16 },
];

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  'cover': 'Cover',
  'index': 'Sommario',
  'identity': 'Identità',
  'social-analysis': 'Analisi Social',
  'personas': 'Buyer Personas',
  'competitors': 'Competitor',
  'synthesis': 'Sintesi',
  'swot': 'SWOT',
  'logo': 'Logo',
  'palette': 'Palette',
  'font': 'Font',
  'reel-proposals': 'Reel',
  'post-proposals': 'Post',
  'mockup': 'Mockup',
  'social-posts': 'Social Posts',
  'phases': 'Fasi',
  'contacts': 'Contatti',
};
