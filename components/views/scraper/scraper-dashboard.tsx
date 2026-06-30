'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Rss, RefreshCw, Download, CheckSquare, Square,
  ExternalLink, Loader2, CheckCircle2, AlertCircle,
  Newspaper, Filter, Search, X, Eye, ArrowUpDown,
  Clock, BadgeCheck, Tag,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

interface Source {
  id: string;
  name: string;
  color: string;
}

interface SourceStatus {
  loaded: boolean;
  count: number;
  error?: string;
  fetchedAt?: string;
}

interface ScrapedItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  link: string;
  pubDate: string;
  sourceName: string;
  sourceId: string;
  image?: string;
  rssCategory?: string;
}

type FetchState = 'idle' | 'loading' | 'done' | 'error';
type ImportState = 'idle' | 'loading' | 'done';

export function ScraperDashboard() {
  const [sources, setSources]           = useState<Source[]>([]);
  const [items, setItems]               = useState<Record<string, ScrapedItem[]>>({});
  const [sourceStatus, setSourceStatus] = useState<Record<string, SourceStatus>>({});
  const [duplicates, setDuplicates]     = useState<Set<string>>(new Set());
  const [selected, setSelected]         = useState<Set<string>>(new Set());
  const [activeSource, setActiveSource] = useState<string>('all');
  const [fetchState, setFetchState]     = useState<FetchState>('idle');
  const [importState, setImportState]   = useState<ImportState>('idle');
  const [importStatus, setImportStatus] = useState<string>('');
  const [importAsPublished, setImportAsPublished] = useState(false);
  const [errorMsg, setErrorMsg]         = useState('');
  const [search, setSearch]             = useState('');
  const [sortAsc, setSortAsc]           = useState(false);
  const [preview, setPreview]           = useState<ScrapedItem | null>(null);
  const [checkingDups, setCheckingDups] = useState(false);

  const fetchNews = useCallback(async (forceRefresh = false) => {
    setFetchState('loading');
    setSelected(new Set());
    setDuplicates(new Set());
    setErrorMsg('');
    setSearch('');
    try {
      const url = `${API}/api/scraper/fetch${forceRefresh ? '?refresh=true' : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('خطا در دریافت اخبار');
      const data = await res.json();
      setSources(data.sources || []);
      setItems(data.items || {});
      setSourceStatus(data.status || {});
      setActiveSource('all');
      setFetchState('done');

      const allFetched = Object.values(data.items || {}).flat() as ScrapedItem[];
      if (allFetched.length > 0) {
        setCheckingDups(true);
        try {
          const dupRes = await fetch(`${API}/api/scraper/check-duplicates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: allFetched }),
          });
          if (dupRes.ok) {
            const dupIds: string[] = await dupRes.json();
            setDuplicates(new Set(dupIds));
          }
        } catch {}
        setCheckingDups(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'خطای ناشناخته');
      setFetchState('error');
    }
  }, []);

  const sourceItems = useMemo<ScrapedItem[]>(() => {
    return activeSource === 'all'
      ? Object.values(items).flat()
      : (items[activeSource] || []);
  }, [items, activeSource]);

  const allItems = useMemo<ScrapedItem[]>(() => {
    let list = sourceItems;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.summary?.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => {
      const ta = new Date(a.pubDate).getTime();
      const tb = new Date(b.pubDate).getTime();
      return sortAsc ? ta - tb : tb - ta;
    });
  }, [sourceItems, search, sortAsc]);

  const totalCount = Object.values(items).reduce((s, arr) => s + arr.length, 0);
  const newItems   = allItems.filter(i => !duplicates.has(i.id));

  const toggleItem = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === newItems.length && newItems.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(newItems.map(i => i.id)));
    }
  };

  const importSelected = async () => {
    if (!selected.size) return;
    setImportState('loading');
    const toImport = Object.values(items).flat().filter(i => selected.has(i.id));
    try {
      const res = await fetch(`${API}/api/scraper/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: toImport, status: importAsPublished ? 'published' : 'draft' }),
      });
      if (!res.ok) throw new Error('خطا در ذخیره‌سازی');
      const result = await res.json();

      const parts: string[] = [`${result.success} خبر اضافه شد`];
      if (result.skipped) parts.push(`${result.skipped} تکراری نادیده گرفته شد`);
      if (result.failed) parts.push(`${result.failed} خطا`);
      setImportStatus(parts.join('  •  '));

      setDuplicates(prev => {
        const next = new Set(prev);
        toImport.forEach(i => next.add(i.id));
        return next;
      });
      setSelected(new Set());
      setImportState('done');
      setTimeout(() => { setImportState('idle'); setImportStatus(''); }, 5000);
    } catch (err: any) {
      setImportStatus(err.message);
      setImportState('done');
      setTimeout(() => { setImportState('idle'); setImportStatus(''); }, 5000);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 mb-1 flex items-center gap-2">
            <Rss className="w-6 h-6 text-emerald-600" />
            اسکرپر اخبار
          </h1>
          <p className="text-gray-400 text-sm">دریافت اخبار از منابع خبری و افزودن به سیستم</p>
        </div>

        <div className="flex items-center gap-2">
          {fetchState === 'done' && (
            <button
              onClick={() => fetchNews(true)}
              title="بارگذاری مجدد بدون کش"
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              به‌روز‌رسانی
            </button>
          )}
          <button
            onClick={() => fetchNews(false)}
            disabled={fetchState === 'loading'}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 cursor-pointer shadow-sm"
          >
            {fetchState === 'loading'
              ? <><Loader2 className="w-4 h-4 animate-spin" /> در حال دریافت...</>
              : <><RefreshCw className="w-4 h-4" /> دریافت اخبار</>}
          </button>
        </div>
      </div>

      {/* Error */}
      {fetchState === 'error' && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Import result */}
      {importState === 'done' && importStatus && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mb-5 text-emerald-700 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {importStatus}
        </div>
      )}

      {/* Idle */}
      {fetchState === 'idle' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Rss className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-base font-bold text-gray-700 mb-1">هنوز اخباری دریافت نشده</h2>
          <p className="text-gray-400 text-sm mb-5">روی «دریافت اخبار» کلیک کنید تا اخبار منابع بارگذاری شوند</p>
          <button
            onClick={() => fetchNews()}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-4 h-4" /> شروع دریافت
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {fetchState === 'loading' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
              <div className="w-5 h-5 rounded bg-gray-100 animate-pulse flex-shrink-0" />
              <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-gray-100 animate-pulse rounded w-3/4" />
                <div className="h-2.5 bg-gray-100 animate-pulse rounded w-1/2" />
              </div>
              <div className="w-16 h-5 bg-gray-100 animate-pulse rounded-full" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {fetchState === 'done' && (
        <>
          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-sm">
              <Newspaper className="w-4 h-4" />
              <span className="font-semibold text-gray-700">{totalCount}</span> خبر
            </div>

            {checkingDups ? (
              <div className="flex items-center gap-1.5 text-sm text-blue-500 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> بررسی تکراری‌ها...
              </div>
            ) : duplicates.size > 0 ? (
              <div className="flex items-center gap-1.5 text-sm text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl">
                <BadgeCheck className="w-4 h-4" />
                <span className="font-semibold">{duplicates.size}</span> تکراری
              </div>
            ) : null}

            <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-sm">
              <Filter className="w-4 h-4" />
              <span className="font-semibold text-gray-700">{selected.size}</span> انتخاب شده
            </div>

            <button
              onClick={() => setSortAsc(p => !p)}
              className="flex items-center gap-1.5 text-sm text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-xl shadow-sm hover:bg-gray-50 transition-colors cursor-pointer mr-auto"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              {sortAsc ? 'قدیمی‌ترین' : 'جدیدترین'}
            </button>
          </div>

          {/* Source tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setActiveSource('all')}
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
                activeSource === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              همه ({totalCount})
            </button>

            {sources.map(s => {
              const st = sourceStatus[s.id];
              const hasError = st && !st.loaded;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSource(s.id)}
                  title={hasError ? st?.error : undefined}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
                    activeSource === s.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : hasError
                        ? 'bg-red-50 border border-red-100 text-red-500 hover:bg-red-100'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {hasError
                    ? <AlertCircle className="w-3 h-3" />
                    : <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />}
                  {s.name} ({items[s.id]?.length || 0})
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="جستجو در عنوان و خلاصه..."
              className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-10 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
              dir="rtl"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Import toolbar */}
          {selected.size > 0 && (
            <div className="flex flex-wrap items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4">
              <span className="text-emerald-800 text-sm font-semibold">
                {selected.size} خبر انتخاب شده
              </span>
              <label className="flex items-center gap-2 text-sm text-emerald-700 cursor-pointer mr-auto">
                <input
                  type="checkbox"
                  checked={importAsPublished}
                  onChange={e => setImportAsPublished(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600"
                />
                منتشر شده (به جای پیش‌نویس)
              </label>
              <button
                onClick={importSelected}
                disabled={importState === 'loading'}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 cursor-pointer shadow-sm"
              >
                {importState === 'loading'
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> در حال ذخیره...</>
                  : <><Download className="w-4 h-4" /> افزودن به اخبار</>}
              </button>
            </div>
          )}

          {/* News list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
              <button
                onClick={toggleAll}
                className="flex items-center gap-2 text-sm text-gray-600 font-medium cursor-pointer hover:text-gray-800"
              >
                {selected.size === newItems.length && newItems.length > 0
                  ? <CheckSquare className="w-4 h-4 text-emerald-600" />
                  : <Square className="w-4 h-4" />}
                انتخاب همه جدید ({newItems.length})
              </button>
              {search && (
                <span className="text-xs text-gray-400">
                  {allItems.length} نتیجه برای «{search}»
                </span>
              )}
            </div>

            {allItems.length === 0 ? (
              <div className="flex flex-col items-center py-14 text-gray-400 gap-2">
                <Newspaper className="w-8 h-8 text-gray-200" />
                <p className="text-sm">{search ? 'نتیجه‌ای یافت نشد' : 'خبری از این منبع دریافت نشد'}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {allItems.map(item => {
                  const isSelected = selected.has(item.id);
                  const isDup = duplicates.has(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => !isDup && toggleItem(item.id)}
                      className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                        isDup
                          ? 'opacity-50 cursor-default bg-gray-50/50'
                          : isSelected
                            ? 'bg-emerald-50/60 cursor-pointer'
                            : 'hover:bg-gray-50 cursor-pointer'
                      }`}
                    >
                      {/* Checkbox / status icon */}
                      <div className="mt-0.5 flex-shrink-0">
                        {isDup
                          ? <BadgeCheck className="w-5 h-5 text-amber-400" title="قبلاً اضافه شده" />
                          : isSelected
                            ? <CheckSquare className="w-5 h-5 text-emerald-600" />
                            : <Square className="w-5 h-5 text-gray-300" />}
                      </div>

                      {/* Thumbnail */}
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=""
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                          onError={e => (e.currentTarget.style.display = 'none')}
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center">
                          <Newspaper className="w-5 h-5 text-gray-300" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 leading-snug mb-1 line-clamp-2">
                          {item.title}
                          {isDup && (
                            <span className="mr-2 text-[10px] font-bold text-amber-500 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full align-middle">
                              تکراری
                            </span>
                          )}
                        </p>
                        {item.summary && (
                          <p className="text-xs text-gray-400 line-clamp-2 mb-2">{item.summary}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">
                            {item.sourceName}
                          </span>
                          {item.rssCategory && (
                            <span className="text-[10px] font-medium bg-violet-50 text-violet-600 border border-violet-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Tag className="w-2.5 h-2.5" />
                              {item.rssCategory}
                            </span>
                          )}
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.pubDate).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 mt-1 flex-shrink-0">
                        <button
                          onClick={e => { e.stopPropagation(); setPreview(item); }}
                          className="text-gray-300 hover:text-blue-500 transition-colors p-1 rounded-lg hover:bg-blue-50 cursor-pointer"
                          title="پیش‌نمایش"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-gray-300 hover:text-emerald-600 transition-colors p-1 rounded-lg hover:bg-emerald-50"
                          title="مشاهده خبر اصلی"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Preview Modal */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">
                  {preview.sourceName}
                </span>
                {preview.rssCategory && (
                  <span className="text-[11px] font-medium bg-violet-50 text-violet-600 border border-violet-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" />
                    {preview.rssCategory}
                  </span>
                )}
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(preview.pubDate).toLocaleDateString('fa-IR')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={preview.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-emerald-600 transition-colors"
                  title="مشاهده خبر اصلی"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setPreview(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6" dir="rtl">
              {preview.image && (
                <img
                  src={preview.image}
                  alt=""
                  className="w-full h-52 object-cover rounded-xl mb-4 border border-gray-100"
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
              )}
              <h2 className="text-lg font-black text-gray-900 mb-3 leading-relaxed">
                {preview.title}
              </h2>
              {preview.summary && preview.summary !== preview.content && (
                <p className="text-sm text-gray-500 mb-4 leading-relaxed border-r-4 border-emerald-200 pr-3">
                  {preview.summary}
                </p>
              )}
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {preview.content}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
