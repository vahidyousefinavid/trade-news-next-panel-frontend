'use client';

import { useState, useEffect, useCallback } from 'react';
import { Eye, TrendingUp, Newspaper, Tag, Star, Zap, RefreshCw, BarChart2, ArrowUp } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

interface NewsItem {
  id: string;
  title: string;
  views: number;
  status: 'published' | 'draft';
  isFeatured: boolean;
  isBreaking: boolean;
  createdAt: string;
  image: string | null;
  category: { id: string; name: string; color: string | null } | null;
}

export function AnalyticsDashboard() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/news`);
      if (res.ok) setNews(await res.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const published = news.filter(n => n.status === 'published');
  const totalViews = news.reduce((s, n) => s + (n.views || 0), 0);
  const avgViews = published.length ? Math.round(totalViews / published.length) : 0;
  const maxViews = news.reduce((m, n) => Math.max(m, n.views || 0), 0);
  const featured = news.filter(n => n.isFeatured).length;
  const breaking = news.filter(n => n.isBreaking).length;

  const topNews = [...news].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);

  const byCategory = news.reduce((acc, n) => {
    const key = n.category?.name || 'بدون دسته‌بندی';
    const color = n.category?.color || '#6b7280';
    if (!acc[key]) acc[key] = { count: 0, views: 0, color };
    acc[key].count++;
    acc[key].views += n.views || 0;
    return acc;
  }, {} as Record<string, { count: number; views: number; color: string }>);

  const categoryList = Object.entries(byCategory).sort((a, b) => b[1].views - a[1].views);
  const maxCatViews = categoryList.reduce((m, [, v]) => Math.max(m, v.views), 0);

  const byMonth = news.reduce((acc, n) => {
    const d = new Date(n.createdAt);
    const key = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = 0;
    acc[key]++;
    return acc;
  }, {} as Record<string, number>);
  const monthList = Object.entries(byMonth).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
  const maxMonth = monthList.reduce((m, [, v]) => Math.max(m, v), 0);

  const statCards = [
    { label: 'کل بازدید', value: totalViews.toLocaleString('fa-IR'), icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'میانگین بازدید', value: avgViews.toLocaleString('fa-IR'), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'بیشترین بازدید', value: maxViews.toLocaleString('fa-IR'), icon: ArrowUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'اخبار ویژه', value: featured, icon: Star, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'اخبار فوری', value: breaking, icon: Zap, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'کل اخبار', value: news.length, icon: Newspaper, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">آمار و بازدید</h1>
          <p className="text-gray-400 text-sm mt-0.5">تحلیل عملکرد پورتال خبری</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm transition-all">
          <RefreshCw className="w-4 h-4" /> به‌روزرسانی
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{loading ? '...' : value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 p-5 border-b border-gray-100">
            <BarChart2 className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-gray-800">پربازدیدترین اخبار (۱۰ خبر برتر)</h2>
          </div>
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="py-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : topNews.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">داده‌ای یافت نشد</p>
            ) : topNews.map((n, i) => (
              <div key={n.id} className="flex items-center gap-3 group">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i === 0 ? 'bg-amber-100 text-amber-700' :
                  i === 1 ? 'bg-gray-200 text-gray-600' :
                  i === 2 ? 'bg-orange-100 text-orange-600' :
                  'bg-gray-50 text-gray-400'
                }`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{n.title}</p>
                  <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all"
                      style={{ width: maxViews ? `${((n.views || 0) / maxViews) * 100}%` : '0%' }} />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-gray-500 flex-shrink-0">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="text-sm font-medium">{(n.views || 0).toLocaleString('fa-IR')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 p-5 border-b border-gray-100">
              <Tag className="w-4 h-4 text-violet-500" />
              <h2 className="text-sm font-semibold text-gray-800">بازدید بر اساس دسته‌بندی</h2>
            </div>
            <div className="p-4 space-y-3">
              {loading ? (
                <div className="py-6 flex justify-center">
                  <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : categoryList.length === 0 ? (
                <p className="text-center text-gray-400 text-xs py-6">داده‌ای یافت نشد</p>
              ) : categoryList.map(([name, data]) => (
                <div key={name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                      <span className="text-gray-700 font-medium">{name}</span>
                      <span className="text-gray-400">({data.count} خبر)</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Eye className="w-3 h-3" />
                      <span>{data.views.toLocaleString('fa-IR')}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: maxCatViews ? `${(data.views / maxCatViews) * 100}%` : '0%',
                        backgroundColor: data.color,
                      }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 p-5 border-b border-gray-100">
              <Newspaper className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-gray-800">تعداد اخبار ماهیانه</h2>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="py-6 flex justify-center">
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : monthList.length === 0 ? (
                <p className="text-center text-gray-400 text-xs py-6">داده‌ای یافت نشد</p>
              ) : (
                <div className="flex items-end gap-2 h-24">
                  {monthList.map(([month, count]) => (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-gray-500">{count}</span>
                      <div className="w-full bg-blue-100 rounded-t-md transition-all"
                        style={{ height: maxMonth ? `${(count / maxMonth) * 72}px` : '4px' }} />
                      <span className="text-[9px] text-gray-400 text-center leading-tight">{month.split('/')[1]}/{month.split('/')[0].slice(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 p-5 border-b border-gray-100">
          <Newspaper className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-800">جدول کامل بازدید اخبار</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-right">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">عنوان</th>
                <th className="px-4 py-3 font-medium">دسته‌بندی</th>
                <th className="px-4 py-3 font-medium">وضعیت</th>
                <th className="px-4 py-3 font-medium">بازدید</th>
                <th className="px-4 py-3 font-medium">تاریخ ثبت</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400">در حال بارگذاری...</td></tr>
              ) : topNews.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400">داده‌ای یافت نشد</td></tr>
              ) : [...news].sort((a, b) => (b.views || 0) - (a.views || 0)).map((n, i) => (
                <tr key={n.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 truncate max-w-[250px]">{n.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    {n.category ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{n.category.name}</span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${
                      n.status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-gray-50 text-gray-500 border border-gray-200'
                    }`}>
                      {n.status === 'published' ? 'منتشر' : 'پیش‌نویس'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-gray-700 font-medium">
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      <span>{(n.views || 0).toLocaleString('fa-IR')}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {n.createdAt ? new Date(n.createdAt).toLocaleDateString('fa-IR') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
