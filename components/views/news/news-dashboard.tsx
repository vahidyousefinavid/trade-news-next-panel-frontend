'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, RefreshCw, Search, SlidersHorizontal, X, Newspaper } from 'lucide-react';
import { NewsTable } from './news-table';
import { NewsFormModal } from './news-form-modal';

export interface News {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  image: string | null;
  status: 'published' | 'draft';
  isFeatured: boolean;
  isBreaking: boolean;
  views: number;
  source: string | null;
  publishedAt: string | null;
  createdAt: string;
  category: { id: string; name: string; color: string | null } | null;
  tags: string[] | null;
}

export interface Category {
  id: string;
  name: string;
  color: string | null;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

export function NewsDashboard() {
  const [news, setNews]             = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch]               = useState('');
  const [filterStatus, setFilterStatus]   = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [nRes, cRes] = await Promise.all([
        fetch(`${API}/api/news`),
        fetch(`${API}/api/categories`),
      ]);
      if (nRes.ok) setNews(await nRes.json());
      if (cRes.ok) setCategories(await cRes.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این خبر مطمئن هستید؟')) return;
    await fetch(`${API}/api/news/${id}`, { method: 'DELETE' });
    setNews(prev => prev.filter(n => n.id !== id));
  };

  const handleEdit  = (n: News) => { setEditingNews(n); setShowForm(true); };
  const handleAdd   = () => { setEditingNews(null); setShowForm(true); };
  const handleSaved = () => { setShowForm(false); setEditingNews(null); fetchData(); };

  const filtered = useMemo(() => news.filter(n => {
    if (search && !n.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus   && n.status !== filterStatus) return false;
    if (filterCategory && n.category?.id !== filterCategory) return false;
    if (filterFeatured === 'featured' && !n.isFeatured) return false;
    if (filterFeatured === 'breaking' && !n.isBreaking) return false;
    return true;
  }), [news, search, filterStatus, filterCategory, filterFeatured]);

  const hasFilters  = !!(search || filterStatus || filterCategory || filterFeatured);
  const clearFilters = () => { setSearch(''); setFilterStatus(''); setFilterCategory(''); setFilterFeatured(''); };

  const published = news.filter(n => n.status === 'published').length;
  const drafts    = news.filter(n => n.status === 'draft').length;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5" dir="rtl">

      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">مدیریت اخبار</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="text-slate-500 text-sm">{news.length} خبر</span>
            <span className="text-slate-300 text-sm hidden sm:inline">·</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{published} منتشر
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              {drafts} پیش‌نویس
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="w-9 h-9 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
              showFilters || hasFilters
                ? 'border-blue-300 bg-blue-50 text-blue-600'
                : 'border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-blue-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            خبر جدید
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="جستجو در عنوان اخبار..."
                className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
              />
            </div>

            {[
              {
                value: filterStatus, setter: setFilterStatus,
                options: [['', 'همه وضعیت‌ها'], ['published', 'منتشر شده'], ['draft', 'پیش‌نویس']],
              },
              {
                value: filterCategory, setter: setFilterCategory,
                options: [['', 'همه دسته‌بندی‌ها'], ...categories.map(c => [c.id, c.name])],
              },
              {
                value: filterFeatured, setter: setFilterFeatured,
                options: [['', 'همه نوع‌ها'], ['featured', 'ویژه'], ['breaking', 'فوری']],
              },
            ].map(({ value, setter, options }, i) => (
              <select key={i} value={value} onChange={e => setter(e.target.value)}
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer">
                {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            ))}

            {hasFilters && (
              <button onClick={clearFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-100 cursor-pointer">
                <X className="w-3.5 h-3.5" /> پاک کردن
              </button>
            )}
          </div>

          {hasFilters && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500 font-medium">
                <span className="font-bold text-slate-800">{filtered.length}</span> نتیجه از {news.length} خبر
              </p>
            </div>
          )}
        </div>
      )}

      <NewsTable news={filtered} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />

      {showForm && (
        <NewsFormModal
          news={editingNews}
          categories={categories}
          apiUrl={API}
          onSaved={handleSaved}
          onClose={() => { setShowForm(false); setEditingNews(null); }}
        />
      )}
    </div>
  );
}
