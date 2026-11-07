'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Upload, LogOut, Download } from 'lucide-react';
import { useCatalog } from '@/hooks/useCatalog';

export default function AdminPage() {
  const { isAdmin, login, logout, exportJSON, importJSON } = useCatalog();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const tryLogin = () => {
    if (!login(password)) setError('Неверный пароль');
    else setError('');
  };

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl bg-slate-900 p-6 ring-1 ring-slate-700">
          <h1 className="mb-4 text-xl font-bold text-white">Админ-панель</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && tryLogin()}
            placeholder="Пароль"
            className="mb-3 w-full rounded bg-slate-800 px-3 py-2 text-white outline-none ring-1 ring-slate-700 focus:ring-emerald-500"
          />
          {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
          <button
            onClick={tryLogin}
            className="w-full rounded bg-emerald-600 py-2 text-white hover:bg-emerald-500"
          >Войти</button>
          <p className="mt-3 text-xs text-slate-500">
            Пароль по умолчанию: <code className="text-slate-300">marvel</code>
          </p>
          <Link href="/" className="mt-4 block text-center text-sm text-slate-400 hover:text-white">
            ← К каталогу
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Админ-панель</h1>
          <button
            onClick={logout}
            className="flex items-center gap-1 rounded bg-red-700 px-3 py-2 text-sm text-white hover:bg-red-600"
          ><LogOut size={16} /> Выйти</button>
        </div>

        <section className="space-y-4 rounded-2xl bg-slate-900 p-6 ring-1 ring-slate-700">
          <h2 className="text-lg font-semibold text-white">Данные</h2>

          <button
            onClick={exportJSON}
            className="flex w-full items-center justify-center gap-2 rounded bg-slate-700 py-2 text-white hover:bg-slate-600"
          ><Download size={16} /> Экспортировать всё (JSON)</button>

          <label className="block cursor-pointer rounded bg-slate-800 py-2 text-center text-white hover:bg-slate-700">
            <Upload size={16} className="inline mr-1" /> Импортировать JSON
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importJSON(f);
              }}
            />
          </label>

          <p className="text-sm text-slate-400">
            CRUD-операции доступны на главной странице — кнопки-карандашики появятся на карточках.
          </p>

          <Link href="/" className="block text-center text-sm text-emerald-400 hover:text-emerald-300">
            → Перейти к каталогу
          </Link>
        </section>
      </div>
    </main>
  );
}