# Strategy Presenter

Applicazione per creare presentazioni strategiche professionali in stile slide-deck, con design ispirato a Not Just Analytics.

## Funzionalità

- **Dashboard** — Visualizza, cerca, duplica ed elimina le tue strategie
- **Creazione Guidata** — Inserisci testo + carica file HTML aggiuntivi, generazione con loading animato
- **Presentazione Interattiva** — Navigazione slide con tastiera, touch e dock macOS-style
- **Modifica in tempo reale** — Modifica titoli e contenuti HTML direttamente nella presentazione
- **Esportazione PDF** — Scarica l'intera presentazione come PDF
- **Database locale** — Tutte le strategie vengono salvate in IndexedDB (persistenza nel browser)
- **Sezioni Standard** — Ogni strategia segue una struttura fissa personalizzabile:
  - Cover, Sommario, Identità, Analisi Social, Buyer Personas
  - Competitor, Sintesi, SWOT, Logo, Palette, Font
  - Proposte Reel/Post, Mockup, Post Social, Fasi Operative, Contatti

## Setup Locale

```bash
# Clona il repository
git clone <tuo-repo-url>
cd strategy-presenter

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev

# Apri http://localhost:3000
```

## Deploy su Vercel

### Metodo 1 — Da GitHub (consigliato)

1. Pusha il progetto su GitHub
2. Vai su [vercel.com](https://vercel.com) e accedi
3. Clicca **"New Project"**
4. Importa il repository GitHub
5. Le impostazioni verranno rilevate automaticamente (Next.js)
6. Clicca **"Deploy"**

### Metodo 2 — CLI

```bash
# Installa Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Struttura del Progetto

```
strategy-presenter/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Dashboard
│   │   ├── new/page.tsx          # Creazione nuova strategia
│   │   ├── strategy/[id]/page.tsx # Visualizzatore/Editor
│   │   ├── layout.tsx            # Layout root
│   │   └── globals.css           # Stili globali + presentazione
│   └── lib/
│       ├── db.ts                 # IndexedDB con Dexie
│       └── types.ts              # TypeScript types
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Stack Tecnologico

- **Next.js 14** — Framework React con App Router
- **TypeScript** — Type safety
- **Tailwind CSS** — Utility-first styling
- **Dexie.js** — Wrapper IndexedDB per persistenza locale
- **html2canvas + jsPDF** — Esportazione PDF
- **Lucide React** — Icone

## Personalizzazione

### Colori
Modifica le variabili CSS in `src/app/globals.css`:
```css
:root {
  --accent: #e6194b;    /* Colore primario */
  --bg: #FAF8F5;        /* Sfondo */
  --card: #fff;         /* Card background */
}
```

### Sezioni
Aggiungi o rimuovi sezioni in `src/lib/types.ts` modificando `SECTION_TEMPLATES`.

### Font
I font predefiniti sono **Outfit** (titoli) e **Source Sans 3** (corpo). Modificabili in `globals.css`.

## Note

- Il database è **client-side** (IndexedDB): i dati restano nel browser dell'utente
- Per un database server-side, considera Vercel Postgres o Supabase
- L'export PDF funziona meglio su desktop (Chrome/Edge)
