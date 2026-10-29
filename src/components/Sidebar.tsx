'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Inicio' },
  { href: '/appointments', label: 'Mis citas' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden sm:flex w-56 shrink-0 flex-col border-r border-neutral-800 bg-neutral-950 px-4 py-6 gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`text-sm font-medium py-2 px-3 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-500 ${
              isActive
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
