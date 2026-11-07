'use client';
import { useState } from 'react';
import { X, RefreshCw } from 'lucide-react';
import type { Movie } from '@/lib/types';

interface Props {
  initial?: Movie;
  universes: Record<string, { name: string; accent: string }>;
  onSave: (m: Movie) => void;
  onClose: () => void;
}

function emptyMovie(): Movie {
  return {
    id: '', title: '', titleRu: '',
    universe: 'mcu',
    chronologyYear: new Date().getFullYear(),
    releaseDate: new Date().toISOString().slice(0, 10),
    events: '', characters: [],
    importance: 'required',
    ratings: { imdb: { score: null, url: '' }, rt: { score: null, url: '' } },
    runtime: 120, postCreditsScenes: 0, director: '',
    poster: { tmdbId: null, directUrl: null },
  };
}

const inputCls = 'w-full rounded bg-slate-800 px-3 py-2 text-sm text-white outline-none ring-1 ring-slate-700 focus:ring-emerald-500';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-slate-400">{label}</span>
      {children}
    </label>
  );
}

export function MovieForm({ initial, universes, onSave, onClose }: Props) {
  const [m, setM] = useState<Movie>(initial ?? emptyMovie());
  const [chars, setChars] = useState((initial?.characters ?? []).join(', '));
  const [refreshing, setRefreshing] = useState(false);

  const update = <K extends keyof Movie>(k: K, v: Movie[K]) =>
    setM((prev) => ({ ...prev, [k]: v }));

  const slugify = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const save = () => {
    if (!m.title.trim()) return alert('Название обязательно');
    const id = m.id || `${slugify(m.title)}-${m.releaseDate.slice(0, 4)}`;
    onSave({ ...m, id, characters: chars.split(',').map((s) => s.trim()).filter(Boolean) });
  };

  const refreshRatings = async () => {
    const match = m.ratings.imdb.url.match(/tt\d+/);
    if (!match) return alert('Укажите IMDb-ссылку с tt-ID (например https://www.imdb.com/title/tt0371746/)');
    setRefreshing(true);
    try {
      const r = await fetch(`/api/ratings?imdbId=${match[0]}`);
      const data = await r.json();
      setM((prev) => ({
        ...prev,
        ratings: {
          imdb: { ...prev.ratings.imdb, score: data.imdb ?? prev.ratings.imdb.score },
          rt: { ...prev.ratings.rt, score: data.rt ?? prev.ratings.rt.score },
        },
      }));
    } catch {
      alert('Не удалось обновить рейтинги');
    } finally {
      setRefreshing(false);
    }
  };

  const posterPreview =
    m.poster.directUrl || (m.poster.tmdbId ? `/api/poster/${m.poster.tmdbId}` : null);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 p-6 ring-1 ring-slate-700 my-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{initial ? 'Редактировать' : 'Новый фильм'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X /></button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Название *">
            <input value={m.title} onChange={(e) => update('title', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Название (RU)">
            <input value={m.titleRu ?? ''} onChange={(e) => update('titleRu', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Вселенная">
            <select value={m.universe} onChange={(e) => update('universe', e.target.value)} className={inputCls}>
              {Object.entries(universes).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
            </select>
          </Field>
          <Field label="Год хронологии">
            <input type="number" value={m.chronologyYear} onChange={(e) => update('chronologyYear', Number(e.target.value))} className={inputCls} />
          </Field>
          <Field label="Дата выхода">
            <input type="date" value={m.releaseDate} onChange={(e) => update('releaseDate', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Важность">
            <select value={m.importance} onChange={(e) => update('importance', e.target.value as any)} className={inputCls}>
              <option value="required">L1 — обязательно</option>
              <option value="optional">Опционально</option>
            </select>
          </Field>
          <Field label="Режиссёр">
            <input value={m.director} onChange={(e) => update('director', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Длительность (мин)">
            <input type="number" value={m.runtime} onChange={(e) => update('runtime', Number(e.target.value))} className={inputCls} />
          </Field>
          <Field label="Сцен после титров">
            <input type="number" value={m.postCreditsScenes} onChange={(e) => update('postCreditsScenes', Number(e.target.value))} className={inputCls} />
          </Field>
          <Field label="TMDB ID">
            <input value={m.poster.tmdbId ?? ''} onChange={(e) => update('poster', { ...m.poster, tmdbId: e.target.value ? Number(e.target.value) : null })} className={inputCls} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Прямая ссылка на постер (приоритет)">
              <input value={m.poster.directUrl ?? ''} onChange={(e) => update('poster', { ...m.poster, directUrl: e.target.value || null })} className={inputCls} placeholder="https://…" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="События">
              <textarea value={m.events} onChange={(e) => update('events', e.target.value)} rows={3} className={inputCls} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Персонажи (через запятую)">
              <input value={chars} onChange={(e) => setChars(e.target.value)} className={inputCls} />
            </Field>
          </div>
          <Field label="Ссылка IMDb">
            <input value={m.ratings.imdb.url} onChange={(e) => update('ratings', { ...m.ratings, imdb: { ...m.ratings.imdb, url: e.target.value } })} className={inputCls} />
          </Field>
          <Field label="Ссылка Rotten Tomatoes">
            <input value={m.ratings.rt.url} onChange={(e) => update('ratings', { ...m.ratings, rt: { ...m.ratings.rt, url: e.target.value } })} className={inputCls} />
          </Field>
        </div>

        <div className="mt-4 flex items-center gap-3">
          {posterPreview && (
            <img src={posterPreview} alt="preview" className="h-32 w-20 object-cover rounded ring-1 ring-slate-700" />
          )}
          <button
            onClick={refreshRatings}
            disabled={refreshing}
            className="flex items-center gap-1 rounded bg-blue-700 px-3 py-2 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Обновить рейтинги (OMDB)
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded bg-slate-700 px-4 py-2 text-white hover:bg-slate-600">Отмена</button>
          <button onClick={save} className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500">Сохранить</button>
        </div>
      </div>
    </div>
  );
}