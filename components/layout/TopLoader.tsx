'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export function TopLoader() {
  const pathname = usePathname();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPathname = useRef(pathname);
  const running = useRef(false);

  const clearAll = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
  };

  const start = () => {
    if (running.current) return;
    running.current = true;
    clearAll();
    setVisible(true);
    setWidth(0);
    let w = 12;
    setWidth(w);
    intervalRef.current = setInterval(() => {
      w += Math.random() * 10 + 3;
      if (w >= 80) { w = 80; clearInterval(intervalRef.current!); }
      setWidth(w);
    }, 200);
  };

  const finish = () => {
    running.current = false;
    clearAll();
    setWidth(100);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setWidth(0), 250);
    }, 300);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http')) return;
      if (anchor.target === '_blank') return;
      const stripped = href.split('?')[0].split('#')[0];
      if (stripped === pathname || stripped === '') return;
      start();
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      finish();
    }
  }, [pathname]);

  useEffect(() => () => clearAll(), []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
      style={{ height: '3px', opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease' }}>
      <div style={{
        height: '100%',
        width: `${width}%`,
        background: 'linear-gradient(to right, #2563eb, #4f46e5, #7c3aed)',
        boxShadow: '0 0 10px #2563eb80, 0 0 4px #2563eb40',
        borderRadius: '0 3px 3px 0',
        transition: width === 100 ? 'width 0.2s ease-out' : 'width 0.2s ease',
      }} />
    </div>
  );
}
