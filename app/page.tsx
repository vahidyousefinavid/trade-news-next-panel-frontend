'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Newspaper, Tag, Eye, FileEdit,
  Clock, Star, RefreshCw, ArrowLeft,
  Plus, BarChart2, CheckCircle2, Activity,
  TrendingUp,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

interface NewsItem {
  id: string;
  title: string;
  status: 'published' | 'draft';
  views: number;
  isFeatured: boolean;
  isBreaking: boolean;
  createdAt: string;
  image: string | null;
  category: { name: string; color: string | null } | null;
}

const STAT_CARDS = [
  {
    key: 'total'      as const,
    title: 'کل اخبار',
    icon: Newspaper,
    href: '/news',
    gradient: 'from-emerald-500 to-teal-500',
    light: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-100',
  },
  {
    key: 'published'  as const,
    title: 'منتشرشده',
    icon: CheckCircle2,
    href: '/news',
    gradient: 'from-blue-500 to-indigo-500',
    light: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-100',
  },
  {
    key: 'drafts'     as const,
    title: 'پیش‌نویس',
    icon: FileEdit,
    href: '/news',
    gradient: 'from-amber-500 to-orange-400',
    light: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-100',
  },
  {
    key: 'categories' as const,
    title: 'دسته‌بندی‌ها',
    icon: Tag,
    href: '/category',
    gradient: 'from-violet-500 to-purple-500',
    light: 'bg-violet-50',
    text: 'text-violet-600',
    border: 'border-violet-100',
  },
];

export default function DashboardPage() {
  const [news,       setNews]       = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<unknown[]>([]);
  const [loading,    setLoading]    = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [n, c] = await Promise.all([
        fetch(`${API}/api/news`).then(r => r.ok ? r.json() : []),
        fetch(`${API}/api/categories`).then(r => r.ok ? r.json() : []),
      ]);
      setNews(n);
      setCategories(c);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const published  = news.filter(n => n.status === 'published').length;
  const drafts     = news.filter(n => n.status === 'draft').length;
  const totalViews = news.reduce((s, n) => s + (n.views || 0), 0);
  const topViewed  = [...news].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  const recentNews = [...news].slice(0, 6);

  const counts: Record<string, number> = {
    total: news.length, published, drafts, categories: categories.length,
  };

  const total = news.length + categories.length;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">

      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 mb-1">خوش آمدید</h1>
          <p className="text-gray-400 text-sm">آمار و اطلاعات کلی سیستم مدیریت اخبار تجارت</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          بروزرسانی
        </button>
      </div>

      {/* Summary banner */}
      <div className="bg-gradient-to-l from-slate-800 to-slate-900 rounded-2xl p-5 mb-8 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white/50 text-xs mb-0.5">مجموع محتوا</p>
            <p className="text-white font-black text-2xl">{loading ? '—' : total}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-white/40 text-xs mb-0.5">بازدید کل</p>
            <p className="text-white font-bold text-lg tabular-nums">
              {loading ? '—' : totalViews.toLocaleString('fa-IR')}
            </p>
          </div>
          <div className="text-center">
            <p className="text-white/40 text-xs mb-0.5">منتشرشده</p>
            <p className="text-emerald-400 font-bold text-lg tabular-nums">
              {loading ? '—' : published}
            </p>
          </div>
          <div className="text-center">
            <p className="text-white/40 text-xs mb-0.5">پیش‌نویس</p>
            <p className="text-amber-400 font-bold text-lg tabular-nums">
              {loading ? '—' : drafts}
            </p>
          </div>
        </div>
        <p className="text-white/20 text-xs hidden sm:block">سیستم مدیریت اخبار تجارت</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        {STAT_CARDS.map(({ key, title, icon: Icon, href, gradient, light, text, border }) => (
          <div
            key={key}
            className={`bg-white rounded-2xl border ${border} shadow-sm hover:shadow-md transition-all duration-200 p-5 sm:p-6`}
          >
            <div className="flex items-start justify-between mb-5 sm:mb-6">
              <div className={`w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-md`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className={`${light} ${text} text-xs font-bold px-2.5 py-1 rounded-full`}>
                فعال
              </span>
            </div>
            <p className="text-gray-400 text-xs mb-1">{title}</p>
            <p className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 sm:mb-5">
              {loading ? <span className="text-gray-200 animate-pulse">—</span> : counts[key]}
            </p>
            <Link
              href={href}
              className={`flex items-center gap-1.5 ${text} text-sm font-semibold hover:underline`}
            >
              مشاهده همه
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">

        {/* Recent news */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-bold text-gray-800">آخرین اخبار</h2>
            </div>
            <Link href="/news" className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer">
              همه <ArrowLeft className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 animate-pulse rounded w-3/4" />
                    <div className="h-2.5 bg-gray-100 animate-pulse rounded w-1/3" />
                  </div>
                </div>
              ))
            ) : recentNews.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-2">
                <Newspaper className="w-8 h-8 text-gray-200" />
                <p className="text-sm text-gray-400">هنوز خبری ثبت نشده</p>
                <Link href="/news" className="text-xs text-emerald-600 hover:underline mt-1 cursor-pointer">
                  افزودن اولین خبر
                </Link>
              </div>
            ) : recentNews.map(n => (
              <div key={n.id} className="flex items-center gap-3.5 px-5 py-3 hover:bg-gray-50 transition-colors">
                {n.image ? (
                  <img src={n.image} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                    onError={e => (e.currentTarget.style.display = 'none')} />
                ) : (
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <Newspaper className="w-4 h-4 text-gray-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{n.title}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {n.status === 'published'
                      ? <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">منتشرشده</span>
                      : <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">پیش‌نویس</span>
                    }
                    {n.isBreaking && <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">فوری</span>}
                    {n.category && <span className="text-[10px] text-gray-400">{n.category.name}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-gray-400 flex-shrink-0">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="text-xs tabular-nums">{(n.views || 0).toLocaleString('fa-IR')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top viewed */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
            <Star className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-gray-800">پربازدیدترین</h2>
          </div>
          <div className="p-4 space-y-3">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 animate-pulse flex-shrink-0" />
                  <div className="flex-1 h-3 bg-gray-100 animate-pulse rounded" />
                </div>
              ))
            ) : topViewed.length === 0 ? (
              <p className="text-center text-gray-400 text-xs py-8">داده‌ای یافت نشد</p>
            ) : topViewed.map((n, i) => (
              <div key={n.id} className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                  i === 0 ? 'bg-amber-100 text-amber-700'
                  : i === 1 ? 'bg-gray-200 text-gray-600'
                  : i === 2 ? 'bg-orange-50 text-orange-600'
                  : 'bg-gray-50 text-gray-400'
                }`}>{i + 1}</span>
                <p className="flex-1 text-xs font-medium text-gray-700 truncate">{n.title}</p>
                <div className="flex items-center gap-1 text-gray-400 flex-shrink-0">
                  <Eye className="w-3 h-3" />
                  <span className="text-[10px] tabular-nums">{(n.views || 0).toLocaleString('fa-IR')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
        <h2 className="text-sm font-bold text-gray-700 mb-4">دسترسی سریع</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/news',      label: 'افزودن خبر',        gradient: 'from-emerald-500 to-teal-500',   icon: Plus },
            { href: '/category',  label: 'دسته‌بندی جدید',    gradient: 'from-blue-500 to-indigo-500',    icon: Tag },
            { href: '/analytics', label: 'گزارش آمار',         gradient: 'from-amber-500 to-orange-400',   icon: BarChart2 },
            { href: '/settings',  label: 'تنظیمات',            gradient: 'from-violet-500 to-purple-500',  icon: TrendingUp },
          ].map(({ href, label, gradient, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`bg-gradient-to-l ${gradient} text-white px-5 py-3 rounded-xl font-semibold text-sm text-center hover:opacity-90 transition-opacity shadow-sm flex items-center justify-center gap-2 cursor-pointer`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
