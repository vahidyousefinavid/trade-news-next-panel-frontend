'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Newspaper, Tag, LogOut,
  BarChart2, Settings, Menu, X, ChevronDown, Rss,
} from 'lucide-react';
import { useState } from 'react';

type NavChild = { href: string; label: string; dot: string; activeClass: string };
type NavLeaf  = { href: string; icon: React.ElementType; label: string; activeClass: string; iconActive: string; dot: string; children?: undefined };
type NavGroup = { href?: undefined; icon: React.ElementType; label: string; activeClass: string; iconActive: string; dot: string; children: NavChild[] };
type NavItem  = NavLeaf | NavGroup;

const NAV: NavItem[] = [
  {
    href: '/',
    icon: LayoutDashboard, label: 'داشبورد',
    activeClass: 'bg-indigo-50 text-indigo-700', iconActive: 'bg-indigo-100 text-indigo-600', dot: 'bg-indigo-500',
  },
  {
    icon: Newspaper, label: 'اخبار',
    activeClass: 'bg-emerald-50 text-emerald-700', iconActive: 'bg-emerald-100 text-emerald-600', dot: 'bg-emerald-500',
    children: [
      { href: '/news',     label: 'مدیریت اخبار',  dot: 'bg-emerald-500', activeClass: 'text-emerald-700' },
      { href: '/category', label: 'دسته‌بندی‌ها',  dot: 'bg-teal-500',    activeClass: 'text-teal-700' },
    ],
  },
  {
    href: '/scraper',
    icon: Rss, label: 'اسکرپر اخبار',
    activeClass: 'bg-emerald-50 text-emerald-700', iconActive: 'bg-emerald-100 text-emerald-600', dot: 'bg-emerald-500',
  },
  {
    href: '/analytics',
    icon: BarChart2, label: 'آمار و گزارش',
    activeClass: 'bg-blue-50 text-blue-700', iconActive: 'bg-blue-100 text-blue-600', dot: 'bg-blue-500',
  },
  {
    href: '/settings',
    icon: Settings, label: 'تنظیمات',
    activeClass: 'bg-slate-100 text-slate-700', iconActive: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isGroupActive = (children: NavChild[]) =>
    children.some(c => pathname === c.href || pathname.startsWith(c.href + '/'));

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      NAV.filter(item => item.children && isGroupActive(item.children))
        .map(item => [item.label, true])
    )
  );

  const toggleGroup = (label: string) =>
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 right-3 z-50 w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-md"
        aria-label="باز کردن منو"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={closeMobile} />
      )}

      <aside
        className={`fixed top-0 right-0 w-64 h-screen bg-white border-l border-gray-100 flex flex-col z-50 shadow-sm transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-white font-black text-base leading-none">ت</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 text-sm font-bold leading-tight">پنل مدیریت</p>
              <p className="text-gray-400 text-xs mt-0.5">اخبار تجارت</p>
            </div>
            <button
              onClick={closeMobile}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 flex-shrink-0"
              aria-label="بستن منو"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          <p className="text-gray-300 text-[10px] font-bold uppercase tracking-widest px-3 mb-3">منو</p>

          {NAV.map(item => {
            if (item.children) {
              const active = isGroupActive(item.children);
              const open   = openGroups[item.label] ?? false;
              const Icon   = item.icon;
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleGroup(item.label)}
                    className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${active ? item.activeClass : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${active ? item.iconActive : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600'}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-sm font-medium flex-1 text-right">{item.label}</span>
                    <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                  </button>

                  {open && (
                    <div className="mt-0.5 mr-3 pr-7 space-y-0.5 border-r-2 border-gray-100">
                      {item.children.map(child => {
                        const childActive = pathname === child.href || pathname.startsWith(child.href + '/');
                        return (
                          <Link key={child.href} href={child.href} onClick={closeMobile}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150 ${childActive ? `bg-gray-50 font-semibold ${child.activeClass}` : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 font-medium'}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${child.dot}`} />
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const { href, icon: Icon, label, activeClass, iconActive, dot } = item;
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link key={href} href={href} onClick={closeMobile}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${isActive ? activeClass : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${isActive ? iconActive : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600'}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className="text-sm font-medium flex-1">{label}</span>
                {isActive && <span className={`w-1.5 h-1.5 rounded-full ${dot} flex-shrink-0`} />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-2">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-700 text-xs font-bold">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-700 truncate">مدیر سیستم</p>
              <p className="text-[10px] text-gray-400 truncate">admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 disabled:opacity-50 group cursor-pointer"
          >
            <span className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-red-100 flex items-center justify-center flex-shrink-0 transition-all">
              <LogOut className="w-4 h-4" />
            </span>
            <span className="text-sm font-medium">{loggingOut ? 'در حال خروج...' : 'خروج از حساب'}</span>
          </button>
          <div className="flex items-center justify-between px-3">
            <p className="text-gray-300 text-xs">نسخه ۱.۰.۰</p>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
          </div>
        </div>
      </aside>
    </>
  );
}
