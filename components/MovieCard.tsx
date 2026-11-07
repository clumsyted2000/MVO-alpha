'use client';
import { useState } from 'react';
import Image from 'next/image';
import {
  Check, Pencil, Trash2, Star, Clock, Film,
  Users, Calendar, Award,
} from 'lucide-react';
import type { Movie } from '@/lib/types';

const ACCENTS: Record<string, { grad: string; border: string; glow: string }> = {
  mcu:        { grad: 'from-red-600 to-orange-500',    border: 'border-red-500/40',    glow: 'shadow-red-500/20' },
  xmen:       { grad: 'from-purple-600 to-blue-600',   border: 'border-purple-500/40', glow: 'shadow-purple-500/20' },
  sony:       { grad: 'from-blue-600 to-cyan-500',     border: 'border-blue-500/40',   glow: 'shadow-blue-500/20' },
  fantastic4: { grad: 'from-indigo-500 to-blue-400',   border: 'border-indigo-500/40', glow: 'shadow-indigo-500/20' },
  other:      { grad: 'from-gray-600 to-gray-500',     border: 'border-gray-500/40',   glow: 'shadow-gray-500/20' },
};

function posterSrc(movie: Movie): string | null {
  if (movie.poster.directUrl) return movie.poster.directUrl;
  if (movie.poster.tmdbId) return `/api/poster/${movie.poster.tmdbId}`;
  return null;
}

interface Props {
  movie: Movie;
  watched: boolean;
  isAdmin: boolean;
  isSelected: boolean;
  onToggleWatched: () => void;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function MovieCard({
  movie, watched, isAdmin, isSelected,
  onToggleWatched, onSelect, onEdit, onDelete,
}: Props) {
  const accent = ACCENTS[movie.universe] ?? ACCENTS.other;
  const src = posterSrc(movie);
  const [err, setErr] = useState(false);

  return (
    <article
      id={`card-${movie.id}`}
      onClick={onSelect}
      className={`
        group relative flex gap-4 rounded-2xl p-4 cursor-pointer
        bg-slate-900/80 backdrop-blur-sm border ${accent.border}
        shadow-lg ${accent.glow} hover:shadow-xl transition-all
        ${isSelected ? 'ring-2 ring-white/60' : ''}
        ${watched ? 'opacity-70' : ''}
      `}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b ${accent.grad}`} />

      <div className="relative w-28 sm:w-32 shrink-0 aspect-[2/3] rounded-lg overflow-hidden bg-slate-800">
        {src && !err ? (
          <Image
            src={src}
            alt={movie.title}
            fill
            sizes="128px"
            className="object-cover"
            onError={() => setErr(true)}
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-600">
            <Film size={32} />
          </div>
        )}
        {movie.importance === 'required' && (
          <span className="absolute top-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">L1</span>
        )}
      </div>

      <div className="min-w-0 flex-1 flex flex-col">
        <header className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-white truncate">{movie.title}</h3>
            {movie.titleRu && <p className="text-xs text-slate-400 truncate">{movie.titleRu}</p>}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {isAdmin && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(); }}
                  className="rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white"
                  title="Редактировать"
                ><Pencil size={14} /></button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="rounded p-1.5 text-slate-400 hover:bg-red-900/60 hover:text-red-300"
                  title="Удалить"
                ><Trash2 size={14} /></button>
              </>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onToggleWatched(); }}
              className={`rounded-full p-1.5 transition ${watched ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
              title={watched ? 'Просмотрено' : 'Отметить'}
            ><Check size={14} /></button>
          </div>
        </header>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
          <span className={`rounded px-1.5 py-0.5 bg-gradient-to-r ${accent.grad} text-white font-semibold`}>
            {movie.universe.toUpperCase()}
          </span>
          <span className="flex items-center gap-1"><Calendar size={11} /> {movie.chronologyYear}</span>
          <span className="flex items-center gap-1"><Clock size={11} /> {movie.runtime} мин</span>
          <span>Выход: {movie.releaseDate}</span>
        </div>

        <p className="mt-2 line-clamp-2 text-xs text-slate-300">{movie.events}</p>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
          <a
            href={movie.ratings.imdb.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 rounded bg-yellow-500/10 px-2 py-0.5 text-yellow-300 hover:bg-yellow-500/20"
          ><Star size={11} fill="currentColor" /> IMDb {movie.ratings.imdb.score ?? '—'}</a>
          <a
            href={movie.ratings.rt.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 rounded bg-red-500/10 px-2 py-0.5 text-red-300 hover:bg-red-500/20"
          >🍅 RT {movie.ratings.rt.score ?? '—'}%</a>
          {movie.postCreditsScenes > 0 && (
            <span className="rounded bg-violet-500/10 px-2 py-0.5 text-violet-300">🎬 {movie.postCreditsScenes}</span>
          )}
        </div>

        <div className="mt-2 flex items-start gap-3 text-[11px] text-slate-400">
          <span className="flex items-start gap-1 min-w-0">
            <Users size={11} className="mt-0.5 shrink-0" />
            <span className="truncate">{movie.characters.slice(0, 3).join(', ')}{movie.characters.length > 3 ? '…' : ''}</span>
          </span>
          <span className="flex items-center gap-1 shrink-0"><Award size={11} /> {movie.director}</span>
        </div>
      </div>
    </article>
  );
}