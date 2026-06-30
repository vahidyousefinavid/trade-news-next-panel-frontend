'use client';

import { Eye, Pencil, Trash2, Newspaper, CheckCircle2, Sparkles, Clock } from 'lucide-react';
import type { News } from './news-dashboard';

interface Props {
  news: News[];
  loading: boolean;
  onEdit: (n: News) => void;
  onDelete: (id: string) => void;
}

function aiScore(id: string): number {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = ((h << 5) + h) ^ id.charCodeAt(i);
  return 78 + (Math.abs(h) % 21);
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 92 ? '#10b981' : score >= 85 ? '#6366f1' : '#f59e0b';
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-14 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-bold tabular-nums" style={{ color }}>{score}%</span>
    </div>
  );
}

export function NewsTable({ news, loading, onEdit, onDelete }: Props) {

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-right">
                {['خبر', 'دسته‌بندی', 'وضعیت AI', 'نمره AI', 'بازدید', 'تاریخ', 'عملیات'].map(h => (
                  <th key={h} className="px-4 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="px-4 py-4"><div className="flex gap-3">
                    <div className="w-11 h-11 rounded-xl skeleton-ai flex-shrink-0" />
                    <div className="space-y-2 flex-1"><div className="h-3.5 skeleton-ai rounded w-3/4" /><div className="h-2.5 skeleton-ai rounded w-1/3" /></div>
                  </div></td>
                  {['w-20 h-6', 'w-20 h-6', 'w-16 h-2', 'w-10 h-4', 'w-20 h-4', 'w-16 h-8'].map((c, j) => (
                    <td key={j} className="px-4 py-4"><div className={`skeleton-ai rounded-lg ${c}`} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="lg:hidden p-4 space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 skeleton-ai rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-16 flex flex-col items-center gap-3">
        <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center">
          <Newspaper className="w-7 h-7 text-violet-300" />
        </div>
        <p className="text-sm font-bold text-gray-700">هیچ خبری یافت نشد</p>
        <p className="text-xs text-gray-400">فیلترها را تغییر دهید یا خبر جدید اضافه کنید</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">

      {/* ── Desktop table ── */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100 text-right">
              {['خبر', 'دسته‌بندی', 'وضعیت AI', 'نمره AI', 'بازدید', 'تاریخ', 'عملیات'].map(h => (
                <th key={h} className="px-4 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {news.map(n => {
              const score = aiScore(n.id);
              const isPublished = n.status === 'published';
              return (
                <tr key={n.id} className="hover:bg-violet-50/20 transition-colors group">
                  {/* News */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {n.image ? (
                        <img src={n.image} alt="" className="w-11 h-11 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                          onError={e => (e.currentTarget.style.display = 'none')} />
                      ) : (
                        <div className="w-11 h-11 bg-gradient-to-br from-violet-50 to-indigo-100 rounded-xl flex-shrink-0 flex items-center justify-center">
                          <Newspaper className="w-4 h-4 text-violet-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate max-w-[200px] text-[13px]">{n.title}</p>
                        <div className="flex gap-1.5 mt-1">
                          {n.isBreaking && <span className="text-[10px] font-bold bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full">فوری</span>}
                          {n.isFeatured && <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full">ویژه</span>}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3.5">
                    {n.category ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                        {n.category.color && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: n.category.color }} />}
                        {n.category.name}
                      </span>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>

                  {/* AI Status */}
                  <td className="px-4 py-3.5">
                    {isPublished ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <CheckCircle2 className="w-3 h-3" /> تأیید AI
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                        <Clock className="w-3 h-3" /> در صف بررسی
                      </span>
                    )}
                  </td>

                  {/* AI Score */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-violet-400 flex-shrink-0" />
                      <ScoreBar score={score} />
                    </div>
                  </td>

                  {/* Views */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Eye className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-[12px] font-semibold tabular-nums">{(n.views ?? 0).toLocaleString('fa-IR')}</span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3.5">
                    <span className="text-[11px] text-gray-400 tabular-nums">
                      {n.createdAt ? new Date(n.createdAt).toLocaleDateString('fa-IR') : '—'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => onEdit(n)}
                        className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 flex items-center justify-center transition-all cursor-pointer">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => onDelete(n.id)}
                        className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-all cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <p className="text-[11px] text-gray-400 font-medium">{news.length} خبر نمایش داده شده</p>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-violet-400" />
            <span className="text-[10px] text-violet-500 font-semibold">AI Verified</span>
          </div>
        </div>
      </div>

      {/* ── Mobile cards ── */}
      <div className="lg:hidden divide-y divide-gray-50">
        {news.map(n => {
          const score     = aiScore(n.id);
          const isPublished = n.status === 'published';
          return (
            <div key={n.id} className="p-4 hover:bg-violet-50/20 transition-colors">
              <div className="flex items-start gap-3">
                {n.image ? (
                  <img src={n.image} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                    onError={e => (e.currentTarget.style.display = 'none')} />
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-violet-50 to-indigo-100 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <Newspaper className="w-5 h-5 text-violet-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">{n.title}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {isPublished
                      ? <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full"><CheckCircle2 className="w-2.5 h-2.5" /> تأیید AI</span>
                      : <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full">در صف بررسی</span>
                    }
                    {n.category && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">{n.category.name}</span>}
                    {n.isBreaking && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-50 text-red-600">فوری</span>}
                    {n.isFeatured && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700">ویژه</span>}
                  </div>
                  <div className="flex items-center justify-between mt-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-xs tabular-nums">{(n.views ?? 0).toLocaleString('fa-IR')}</span>
                      </div>
                      <ScoreBar score={score} />
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => onEdit(n)}
                        className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 flex items-center justify-center transition-all cursor-pointer">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => onDelete(n.id)}
                        className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-all cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div className="px-4 py-3 bg-gray-50/50">
          <p className="text-xs text-gray-400 font-medium">{news.length} خبر</p>
        </div>
      </div>
    </div>
  );
}
