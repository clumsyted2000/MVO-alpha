'use client';
import { useEffect, useState } from 'react';
import type { Catalog, Movie } from '@/lib/types';
import { DEFAULT_CATALOG } from '@/lib/seed';

const KEY_CATALOG = 'marvel_catalog_v1';
const KEY_WATCHED = 'marvel_watched';
const KEY_ADMIN = 'marvel_is_admin';
const ADMIN_PASSWORD = 'marvel';

export function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [watched, setWatched] = useState<Record<string, boolean>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rawCat = localStorage.getItem(KEY_CATALOG);
    const rawWatched = localStorage.getItem(KEY_WATCHED);
    const rawAdmin = localStorage.getItem(KEY_ADMIN);
    try {
      setCatalog(rawCat ? JSON.parse(rawCat) : DEFAULT_CATALOG);
    } catch {
      setCatalog(DEFAULT_CATALOG);
    }
    try {
      setWatched(rawWatched ? JSON.parse(rawWatched) : {});
    } catch {
      setWatched({});
    }
    setIsAdmin(rawAdmin === 'true');
    setLoading(false);
  }, []);

  useEffect(() => {
    if (catalog) localStorage.setItem(KEY_CATALOG, JSON.stringify(catalog));
  }, [catalog]);

  useEffect(() => {
    localStorage.setItem(KEY_WATCHED, JSON.stringify(watched));
  }, [watched]);

  useEffect(() => {
    localStorage.setItem(KEY_ADMIN, String(isAdmin));
  }, [isAdmin]);

  const touch = (c: Catalog): Catalog => ({ ...c, meta: { ...c.meta, updatedAt: new Date().toISOString() } });

  const toggleWatched = (id: string) =>
    setWatched((w) => ({ ...w, [id]: !w[id] }));

  const addMovie = (movie: Movie) =>
    setCatalog((c) => c ? touch({ ...c, movies: [...c.movies, movie] }) : c);

  const updateMovie = (movie: Movie) =>
    setCatalog((c) => c ? touch({ ...c, movies: c.movies.map((m) => m.id === movie.id ? movie : m) }) : c);

  const deleteMovie = (id: string) =>
    setCatalog((c) => c ? touch({
      ...c,
      movies: c.movies.filter((m) => m.id !== id),
      links: c.links.filter((l) => l.source !== id && l.target !== id),
    }) : c);

  const addLink = (link: import('@/lib/types').Link) =>
    setCatalog((c) => c ? touch({ ...c, links: [...c.links, link] }) : c);

  const deleteLink = (id: string) =>
    setCatalog((c) => c ? touch({ ...c, links: c.links.filter((l) => l.id !== id) }) : c);

  const exportJSON = () => {
    if (!catalog) return;
    const blob = new Blob([JSON.stringify(catalog, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marvel-catalog-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (!data.movies || !data.links) throw new Error('Неверный формат');
        setCatalog(data);
      } catch (e) {
        alert('Ошибка импорта: ' + (e as Error).message);
      }
    };
    reader.readAsText(file);
  };

  const login = (password: string) => {
    if (password === ADMIN_PASSWORD) { setIsAdmin(true); return true; }
    return false;
  };
  const logout = () => setIsAdmin(false);

  return {
    catalog, watched, isAdmin, loading,
    toggleWatched, addMovie, updateMovie, deleteMovie,
    addLink, deleteLink,
    exportJSON, importJSON, login, logout,
  };
}