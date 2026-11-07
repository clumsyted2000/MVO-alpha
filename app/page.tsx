'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Download, LogIn } from 'lucide-react';
import { MovieCard } from '@/components/MovieCard';
import { MovieForm } from '@/components/MovieForm';
import { useCatalog } from '@/hooks/useCatalog';
import { useLeaderLines } from '@/hooks/useLeaderLines';
import type { Movie } from '@/lib/types';

export default function HomePage() {
  const {
    catalog, watched, isAdmin, loading,
    toggleWatched, updateMovie, addMovie, deleteMovie, exportJSON,
  } = useCatalog();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Movie | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    if (!catalog) return [];
    const q = query.trim().toLowerCase();
    if (!q) return catalog.movies;
    return catalog.movies.filter((m) =>
      [m.title, m.titleRu, m.director, m.universe, String(m.chronologyYear), ...m.characters]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [catalog, query]);

  useLeaderLines({
    links: catalog?.links ?? [],
    selectedId,
    enabled: !query && !editing && !creating,
  });

  if (loading || !catalog) {
    return <div className="p-8 text-slate-400">Загрузка…</div>;
  }

  const watchedCount = Object.values(watched).filter(Boolean).length;

  return (
    <main className="min-h-screen bg-slate-950 p-4 md:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{catalog.meta.title}</h1>
          <p className="text-sm text-slate-400">
            {catalog.movies.length} фильмов · {watchedCount} просмотрено
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <button
                onClick={() => setCreating(true)}
                className="flex items-center gap-1 rounded bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-500"
              ><Plus size={16} /> Добавить</button>
              <button
                onClick={exportJSON}
                className="flex items-center gap-1 rounded bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-600"
              ><Download size={16} /> Экспорт</button>
            </>
          )}
          <Link
            href="/admin"
            className="flex items-center gap-1 rounded bg-slate-800 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
          ><LogIn size={16} /> Админ</Link>
        </div>
      </header>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск: название, персонаж, режиссёр, год…"
        className="mb-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-white ring-1 ring-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            watched={!!watched[movie.id]}
            isAdmin={isAdmin}
            isSelected={selectedId === movie.id}
            onToggleWatched={() => toggleWatched(movie.id)}
            onSelect={() => setSelectedId((s) => (s === movie.id ? null : movie.id))}
            onEdit={() => setEditing(movie)}
            onDelete={() => {
              if (confirm(`Удалить «${movie.title}»?`)) deleteMovie(movie.id);
            }}
          />
        ))}
      </div>

      {editing && (
        <MovieForm
          initial={editing}
          universes={catalog.universes}
          onSave={(m) => { updateMovie(m); setEditing(null); }}
          onClose={() => setEditing(null)}
        />
      )}
      {creating && (
        <MovieForm
          universes={catalog.universes}
          onSave={(m) => { addMovie(m); setCreating(false); }}
          onClose={() => setCreating(false)}
        />
      )}
    </main>
  );
}