'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'ダッシュボード', href: '/admin' },
  { label: '問い合わせ管理', href: '/admin/inquiries' },
  { label: '金融会社管理', href: '/admin/companies' },
  { label: 'ユーザー管理', href: '/admin/users' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-gray-900 text-gray-100 flex flex-col min-h-screen">
      <div className="px-4 py-5 border-b border-gray-700">
        <span className="text-sm font-semibold tracking-wide text-gray-400 uppercase">Admin</span>
      </div>
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map(({ label, href }) => {
          const active =
            href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`block rounded px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
