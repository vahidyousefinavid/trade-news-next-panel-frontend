'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Tag, RefreshCw, Loader2, X, FolderOpen } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  createdAt: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />;
}

export function CategoryDashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/categories`);
      if (res.ok) setCategories(await res.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این دسته‌بندی مطمئن هستید؟')) return;
    await fetch(`${API}/api/categories/${id}`, { method: 'DELETE' });
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const openEdit = (cat: Category) => { setEditing(cat); setShowForm(true); };
  const openAdd = () => { setEditing(null); setShowForm(true); };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6" dir="rtl">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">دسته‌بندی‌ها</h1>
          <p className="text-slate-500 text-sm mt-1">{categories.length} دسته‌بندی در سیستم</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCategories}
            className="w-9 h-9 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-emerald-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            دسته‌بندی جدید
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-11 h-11 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
            <FolderOpen className="w-7 h-7 text-slate-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">هنوز دسته‌بندی ایجاد نشده</p>
            <p className="text-xs text-slate-400 mt-1">اولین دسته‌بندی را اضافه کنید</p>
          </div>
          <button onClick={openAdd}
            className="mt-1 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm">
            <Plus className="w-3.5 h-3.5" /> اضافه کردن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map(cat => {
            const hex = cat.color || '#6366f1';
            const bgTint = hex + '18';
            return (
              <div
                key={cat.id}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
              >
                {/* Color stripe */}
                <div className="h-1.5 w-full" style={{ backgroundColor: hex }} />

                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: bgTint }}
                    >
                      <Tag className="w-5 h-5" style={{ color: hex }} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="font-bold text-slate-800 truncate text-sm">{cat.name}</p>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">{cat.slug}</p>
                    </div>
                  </div>

                  {cat.description && (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">{cat.description}</p>
                  )}

                  <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100">
                    <div
                      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: bgTint, color: hex }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: hex }} />
                      {cat.color || '#6366f1'}
                    </div>
                    <div className="flex-1" />
                    <button
                      onClick={() => openEdit(cat)}
                      className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <CategoryFormModal
          category={editing}
          apiUrl={API}
          onSaved={() => { setShowForm(false); fetchCategories(); }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

function CategoryFormModal({
  category, apiUrl, onSaved, onClose,
}: {
  category: Category | null;
  apiUrl: string;
  onSaved: () => void;
  onClose: () => void;
}) {
  const isEdit = !!category;
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [color, setColor] = useState(category?.color || '#6366f1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const PRESET_COLORS = [
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#14b8a6', '#06b6d4', '#0ea5e9', '#64748b',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('نام دسته‌بندی الزامی است'); return; }
    setLoading(true);
    setError('');
    const body = { name: name.trim(), description: description.trim() || undefined, color };
    try {
      const url = isEdit ? `${apiUrl}/api/categories/${category!.id}` : `${apiUrl}/api/categories`;
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) onSaved();
      else { const d = await res.json(); setError(d.message || 'خطا در ذخیره'); }
    } catch { setError('خطا در اتصال'); }
    setLoading(false);
  };

  const inputCls = "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all";

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Tag className="w-4.5 h-4.5 text-emerald-600" style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{isEdit ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{isEdit ? 'اطلاعات را ویرایش کنید' : 'اطلاعات دسته‌بندی را وارد کنید'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">نام دسته‌بندی *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              placeholder="مثال: بورس و سهام"
              className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">توضیحات</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              placeholder="توضیح کوتاه درباره این دسته‌بندی..."
              className={inputCls + ' resize-none'} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">رنگ شناسه</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_COLORS.map(c => (
                <button
                  key={c} type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-lg transition-all cursor-pointer ${color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input type="color" value={color} onChange={e => setColor(e.target.value)}
                  className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-1" />
              </div>
              <div className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50">
                <p className="text-xs font-mono text-slate-600" dir="ltr">{color}</p>
              </div>
              <div className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
                <Tag className="w-4 h-4" style={{ color }} />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm shadow-emerald-200 cursor-pointer">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> ذخیره...</> : isEdit ? 'ذخیره تغییرات' : 'ایجاد دسته‌بندی'}
            </button>
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all cursor-pointer">
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
