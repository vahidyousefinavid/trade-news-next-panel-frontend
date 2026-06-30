import './globals.css';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopLoader } from '@/components/layout/TopLoader';
import { AUTH_COOKIE, SESSION_SECRET } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'پنل مدیریت اخبار تجارت',
  description: 'سیستم مدیریت پورتال خبری تجارت',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get(AUTH_COOKIE)?.value === SESSION_SECRET;

  return (
    <html lang="fa" dir="rtl" className="light" style={{ colorScheme: 'light' }}>
      <body className="font-sans">
        <TopLoader />
        {isAuthenticated && <Sidebar />}
        <main className={isAuthenticated ? 'lg:mr-64 min-h-screen bg-slate-50 pt-14 lg:pt-0' : 'min-h-screen'}>
          {children}
        </main>
      </body>
    </html>
  );
}
