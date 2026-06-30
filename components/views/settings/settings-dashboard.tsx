'use client';

import { useState, useEffect } from 'react';
import { Settings, Globe, Search, Share2, Sliders, Save, Check, Eye, EyeOff } from 'lucide-react';

const STORAGE_KEY = 'trade_news_settings';

interface SiteSettings {
  siteName: string;
  siteTagline: string;
  siteUrl: string;
  logoText: string;
  metaDescription: string;
  metaKeywords: string;
  googleAnalyticsId: string;
  telegram: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  newsPerPage: number;
  featuredCount: number;
  breakingEnabled: boolean;
  showViewCount: boolean;
  defaultStatus: 'published' | 'draft';
  adminPassword: string;
}

const defaults: SiteSettings = {
  siteName: 'اخبار تجارت',
  siteTagline: 'آخرین اخبار اقتصادی و تجاری',
  siteUrl: '',
  logoText: 'تجارت',
  metaDescription: 'جامع‌ترین پورتال اخبار تجارت، اقتصاد و بازار',
  metaKeywords: 'اخبار, تجارت, اقتصاد, بورس, ارز',
  googleAnalyticsId: '',
  telegram: '',
  twitter: '',
  instagram: '',
  linkedin: '',
  newsPerPage: 12,
  featuredCount: 4,
  breakingEnabled: true,
  showViewCount: true,
  defaultStatus: 'draft',
  adminPassword: '',
};

type Tab = 'site' | 'seo' | 'social' | 'display' | 'security';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'site', label: 'اطلاعات سایت', icon: Globe },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'social', label: 'شبکه‌های اجتماعی', icon: Share2 },
  { id: 'display', label: 'نمایش', icon: Sliders },
  { id: 'security', label: 'امنیت', icon: Settings },
];

export function SettingsDashboard() {
  const [settings, setSettings] = useState<SiteSettings>(defaults);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('site');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSettings({ ...defaults, ...JSON.parse(stored) });
    } catch {}
  }, []);

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {}
  };

  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder-gray-300";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">تنظیمات</h1>
          <p className="text-gray-400 text-sm mt-0.5">پیکربندی و شخصی‌سازی پورتال</p>
        </div>
        <button onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm ${
            saved ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}>
          {saved ? <><Check className="w-4 h-4" /> ذخیره شد</> : <><Save className="w-4 h-4" /> ذخیره تنظیمات</>}
        </button>
      </div>

      <div className="flex gap-5">
        <div className="w-52 flex-shrink-0">
          <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 space-y-0.5">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  activeTab === id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          {activeTab === 'site' && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-gray-800 pb-3 border-b border-gray-100">اطلاعات سایت</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>نام سایت</label>
                  <input type="text" value={settings.siteName} onChange={e => set('siteName', e.target.value)} placeholder="اخبار تجارت" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>متن لوگو</label>
                  <input type="text" value={settings.logoText} onChange={e => set('logoText', e.target.value)} placeholder="تجارت" className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>شعار سایت</label>
                <input type="text" value={settings.siteTagline} onChange={e => set('siteTagline', e.target.value)} placeholder="آخرین اخبار اقتصادی و تجاری" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>آدرس سایت (URL)</label>
                <input type="url" value={settings.siteUrl} onChange={e => set('siteUrl', e.target.value)} placeholder="https://example.com" className={inputCls} dir="ltr" />
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 leading-6">
                این تنظیمات در مرورگر شما ذخیره می‌شوند. برای اعمال کامل روی سایت، این مقادیر را در فایل `.env` بک‌اند هم تنظیم کنید.
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-gray-800 pb-3 border-b border-gray-100">بهینه‌سازی موتور جستجو (SEO)</h2>
              <div>
                <label className={labelCls}>توضیحات متا (Meta Description)</label>
                <textarea value={settings.metaDescription} onChange={e => set('metaDescription', e.target.value)} rows={3}
                  placeholder="توضیح کوتاه برای نمایش در نتایج گوگل..."
                  className={inputCls + ' resize-none'} />
                <p className="text-xs text-gray-400 mt-1">{settings.metaDescription.length}/160 کاراکتر</p>
              </div>
              <div>
                <label className={labelCls}>کلمات کلیدی (Keywords)</label>
                <input type="text" value={settings.metaKeywords} onChange={e => set('metaKeywords', e.target.value)}
                  placeholder="اخبار, تجارت, اقتصاد, بورس" className={inputCls} />
                <p className="text-xs text-gray-400 mt-1">کلمات کلیدی را با کاما جدا کنید</p>
              </div>
              <div>
                <label className={labelCls}>شناسه Google Analytics (اختیاری)</label>
                <input type="text" value={settings.googleAnalyticsId} onChange={e => set('googleAnalyticsId', e.target.value)}
                  placeholder="G-XXXXXXXXXX" className={inputCls} dir="ltr" />
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-gray-800 pb-3 border-b border-gray-100">شبکه‌های اجتماعی</h2>
              {[
                { key: 'telegram' as const, label: 'تلگرام', placeholder: '@channel_name یا https://t.me/...' },
                { key: 'instagram' as const, label: 'اینستاگرام', placeholder: '@username یا https://instagram.com/...' },
                { key: 'twitter' as const, label: 'توییتر / X', placeholder: '@username یا https://x.com/...' },
                { key: 'linkedin' as const, label: 'لینکدین', placeholder: 'https://linkedin.com/company/...' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className={labelCls}>{label}</label>
                  <input type="text" value={settings[key]} onChange={e => set(key, e.target.value)}
                    placeholder={placeholder} className={inputCls} dir="ltr" />
                </div>
              ))}
              <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 leading-6">
                لینک‌های شبکه‌های اجتماعی در فوتر سایت نمایش داده می‌شوند.
              </div>
            </div>
          )}

          {activeTab === 'display' && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-gray-800 pb-3 border-b border-gray-100">تنظیمات نمایش</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>تعداد اخبار در هر صفحه</label>
                  <select value={settings.newsPerPage} onChange={e => set('newsPerPage', +e.target.value)} className={inputCls}>
                    {[6, 9, 12, 15, 18, 24].map(n => <option key={n} value={n}>{n} خبر</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>تعداد اخبار ویژه در صفحه اول</label>
                  <select value={settings.featuredCount} onChange={e => set('featuredCount', +e.target.value)} className={inputCls}>
                    {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} خبر</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>وضعیت پیش‌فرض خبر جدید</label>
                <select value={settings.defaultStatus} onChange={e => set('defaultStatus', e.target.value as any)} className={inputCls}>
                  <option value="draft">پیش‌نویس</option>
                  <option value="published">منتشر شده</option>
                </select>
              </div>
              <div className="space-y-3 pt-2">
                {[
                  { key: 'breakingEnabled' as const, label: 'نمایش اخبار فوری', desc: 'تیکر اخبار فوری در بالای سایت' },
                  { key: 'showViewCount' as const, label: 'نمایش تعداد بازدید', desc: 'آمار بازدید را روی کارت‌های خبر نشان می‌دهد' },
                ].map(({ key, label, desc }) => (
                  <label key={key} className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5">
                      <input type="checkbox" checked={settings[key] as boolean} onChange={e => set(key, e.target.checked)}
                        className="sr-only" />
                      <div onClick={() => set(key, !settings[key])}
                        className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${settings[key] ? 'bg-blue-600' : 'bg-gray-200'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute top-1 transition-all ${settings[key] ? 'left-5' : 'left-1'}`} />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{label}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-gray-800 pb-3 border-b border-gray-100">امنیت و دسترسی</h2>
              <div>
                <label className={labelCls}>رمز عبور جدید پنل مدیریت</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={settings.adminPassword}
                    onChange={e => set('adminPassword', e.target.value)}
                    placeholder="رمز عبور جدید (حداقل ۸ کاراکتر)"
                    className={inputCls + ' pl-10'}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">برای تغییر رمز عبور، فایل <code className="bg-gray-100 px-1 rounded">.env</code> پنل را ویرایش کنید.</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-700 leading-6">
                <strong>توجه:</strong> رمز عبور پنل در فایل <code className="bg-amber-100 px-1 rounded">.env</code> پنل ذخیره می‌شود. مقدار <code className="bg-amber-100 px-1 rounded">SESSION_SECRET</code> را تغییر دهید و سرور را ری‌استارت کنید.
              </div>
              <div className="border border-gray-100 rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-3">اطلاعات سیستم</p>
                {[
                  { label: 'نسخه پنل', value: '1.0.0' },
                  { label: 'آدرس API', value: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001' },
                  { label: 'فریم‌ورک', value: 'Next.js 15' },
                  { label: 'بک‌اند', value: 'NestJS + TypeORM' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="text-gray-800 font-mono text-xs bg-gray-50 px-2 py-0.5 rounded" dir="ltr">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
