'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Upload, ImageIcon, Newspaper, Tag, Globe, Sparkles, Cpu, Wand2, CheckCircle2 } from 'lucide-react';
import type { News, Category } from './news-dashboard';

interface Props {
  news: News | null;
  categories: Category[];
  apiUrl: string;
  onSaved: () => void;
  onClose: () => void;
}

export function NewsFormModal({ news, categories, apiUrl, onSaved, onClose }: Props) {
  const isEdit = !!news;
  const [loading,      setLoading]      = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [aiLoading,    setAiLoading]    = useState(false);
  const [aiDone,       setAiDone]       = useState(false);
  const [error,        setError]        = useState('');

  const [title,      setTitle]      = useState(news?.title || '');
  const [summary,    setSummary]    = useState(news?.summary || '');
  const [content,    setContent]    = useState('');
  const [image,      setImage]      = useState(news?.image || '');
  const [categoryId, setCategoryId] = useState(news?.category?.id || '');
  const [status,     setStatus]     = useState<'published' | 'draft'>(news?.status || 'draft');
  const [isFeatured, setIsFeatured] = useState(news?.isFeatured || false);
  const [isBreaking, setIsBreaking] = useState(news?.isBreaking || false);
  const [source,     setSource]     = useState(news?.source || '');
  const [tags,       setTags]       = useState((news?.tags || []).join(', '));

  useEffect(() => {
    if (isEdit && news?.id) {
      fetch(`${apiUrl}/api/news/${news.id}`).then(r => r.json()).then(d => setContent(d.content || ''));
    }
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('image', file);
    try {
      const res = await fetch(`${apiUrl}/api/upload`, { method: 'POST', body: form });
      if (res.ok) { const d = await res.json(); setImage(`${apiUrl}${d.url}`); }
    } catch {}
    setUploading(false);
  };

  const handleAiGenerate = async () => {
    if (!title.trim()) { setError('ابتدا عنوان خبر را وارد کنید تا هوش مصنوعی متن تولید کند'); return; }
    setAiLoading(true);
    setError('');
    try {
      const catName = categories.find(c => c.id === categoryId)?.name || '';
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), category: catName }),
      });
      if (res.ok) {
        const d = await res.json();
        if (d.summary) setSummary(d.summary);
        if (d.content) setContent(d.content);
        setAiDone(true);
        setTimeout(() => setAiDone(false), 3000);
      } else {
        setError('خطا در ارتباط با هوش مصنوعی. لطفاً دوباره تلاش کنید.');
      }
    } catch {
      setError('خطا در ارتباط با سرور هوش مصنوعی');
    }
    setAiLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) { setError('عنوان و متن خبر الزامی هستند'); return; }
    setLoading(true);
    setError('');
    const body = {
      title: title.trim(),
      summary: summary.trim() || undefined,
      content: content.trim(),
      image: image || undefined,
      categoryId: categoryId || undefined,
      status, isFeatured, isBreaking,
      source: source.trim() || undefined,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    try {
      const url = isEdit ? `${apiUrl}/api/news/${news!.id}` : `${apiUrl}/api/news`;
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) onSaved();
      else { const d = await res.json(); setError(d.message || 'خطا در ذخیره'); }
    } catch { setError('خطا در اتصال به سرور'); }
    setLoading(false);
  };

  const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 bg-gray-50 focus:bg-white rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-modal border border-gray-100">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isEdit ? 'bg-amber-50' : 'bg-violet-50'}`}>
              <Newspaper className={`w-[18px] h-[18px] ${isEdit ? 'text-amber-500' : 'text-violet-500'}`} />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900">{isEdit ? 'ویرایش خبر' : 'افزودن خبر جدید'}</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">{isEdit ? 'تغییرات را اعمال کنید' : 'ایجاد خبر با پشتیبانی هوش مصنوعی'}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* AI Generate Banner */}
        <div className="mx-6 mt-5 mb-1 bg-gradient-to-l from-violet-50 to-indigo-50 border border-violet-100 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(124,58,237,0.3)]">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-violet-900">دستیار هوش مصنوعی</p>
            <p className="text-[11px] text-violet-500 mt-0.5">عنوان را وارد کنید و هوش مصنوعی متن کامل خبر را تولید می‌کند</p>
          </div>
          <button
            type="button"
            onClick={handleAiGenerate}
            disabled={aiLoading || !title.trim()}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex-shrink-0 cursor-pointer ${
              aiDone
                ? 'bg-emerald-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]'
                : 'bg-gradient-to-l from-violet-600 to-indigo-600 text-white shadow-[0_4px_12px_rgba(124,58,237,0.3)] hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {aiLoading
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> در حال تولید...</>
              : aiDone
                ? <><CheckCircle2 className="w-3.5 h-3.5" /> تولید شد!</>
                : <><Wand2 className="w-3.5 h-3.5" /> تولید با AI</>
            }
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="px-6 py-5 space-y-5">

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                عنوان خبر *
              </label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
                placeholder="عنوان کامل خبر را وارد کنید..."
                className={inputCls} />
            </div>

            {/* Summary */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                خلاصه
                {summary && <span className="text-[9px] font-bold text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded-full normal-case">AI</span>}
              </label>
              <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={2}
                placeholder="خلاصه‌ای کوتاه از خبر..."
                className={inputCls + ' resize-none'} />
            </div>

            {/* Content */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                متن کامل خبر *
                {content && aiDone && <span className="text-[9px] font-bold text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded-full normal-case flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5" /> تولید AI</span>}
              </label>
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={8} required
                placeholder="متن کامل خبر را اینجا بنویسید یا از دکمه «تولید با AI» استفاده کنید..."
                className={inputCls + ' resize-none leading-7'} />
            </div>

            <div className="border-t border-gray-100" />

            {/* Image + Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  <span className="flex items-center gap-1.5"><ImageIcon className="w-3 h-3" /> تصویر</span>
                </label>
                <label className={`flex flex-col items-center gap-2 px-3 py-4 border-2 border-dashed rounded-xl cursor-pointer transition-all text-sm
                  ${uploading ? 'border-violet-300 bg-violet-50' : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/30'}`}>
                  {image ? (
                    <img src={image} alt="" className="w-full h-24 object-cover rounded-lg"
                      onError={e => (e.currentTarget.style.display = 'none')} />
                  ) : (
                    <>
                      <Upload className={`w-5 h-5 ${uploading ? 'text-violet-500 animate-bounce' : 'text-gray-400'}`} />
                      <span className={`text-xs font-semibold ${uploading ? 'text-violet-600' : 'text-gray-500'}`}>
                        {uploading ? 'در حال آپلود...' : 'انتخاب تصویر'}
                      </span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
                {image && (
                  <button type="button" onClick={() => setImage('')}
                    className="mt-1.5 w-full text-xs text-red-500 hover:text-red-600 font-semibold transition-colors cursor-pointer">
                    حذف تصویر
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    <span className="flex items-center gap-1.5"><Tag className="w-3 h-3" /> دسته‌بندی</span>
                  </label>
                  <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={inputCls}>
                    <option value="">بدون دسته‌بندی</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">وضعیت</label>
                  <select value={status} onChange={e => setStatus(e.target.value as 'published' | 'draft')} className={inputCls}>
                    <option value="draft">پیش‌نویس</option>
                    <option value="published">منتشر شده</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Source + Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> منبع</span>
                </label>
                <input type="text" value={source} onChange={e => setSource(e.target.value)}
                  placeholder="نام منبع خبر" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> برچسب‌ها</span>
                </label>
                <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                  placeholder="بورس, دلار, صادرات" className={inputCls} />
              </div>
            </div>

            {/* Toggles */}
            <div className="flex gap-3">
              {[
                { state: isFeatured, setter: setIsFeatured, label: 'خبر ویژه',  color: 'bg-amber-500', desc: 'نمایش در صفحه اول' },
                { state: isBreaking, setter: setIsBreaking, label: 'خبر فوری',  color: 'bg-red-500',   desc: 'نمایش در تیکر فوری' },
              ].map(({ state, setter, label, color, desc }) => (
                <label key={label} className="flex-1 flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300 hover:bg-gray-50/50 transition-all">
                  <div className="relative mt-0.5 flex-shrink-0" onClick={() => setter(!state)}>
                    <div className={`w-9 h-5 rounded-full transition-colors ${state ? color : 'bg-gray-200'}`} />
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${state ? 'left-4' : 'left-0.5'}`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex-shrink-0">
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-gradient-to-l from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(124,58,237,0.3)] cursor-pointer">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> در حال ذخیره...</> : isEdit ? 'ذخیره تغییرات' : 'انتشار خبر'}
            </button>
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-all cursor-pointer">
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
