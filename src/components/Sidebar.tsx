'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authService } from '@/services/authService';

const NAV_ITEMS = [
  { href: '/', label: 'Inicio' },
  { href: '/appointments', label: 'Mis citas' },
];

const ADMIN_NAV_ITEM = { href: '/admin/settings', label: 'Configuración de aplicación' };

export default function Sidebar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkIsAdmin = async () => {
      try {
        const result = await authService.validate();
        setIsAdmin(result.role === 'admin');
      } catch (err: unknown) {
        console.error('Error al validar el rol del usuario', err);
      }
    };

    checkIsAdmin();
  }, []);

  const navItems = isAdmin ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS;

  return (
    <aside className="hidden sm:flex w-56 shrink-0 flex-col border-r border-neutral-800 bg-neutral-950 px-4 py-6 gap-1">
      {navItems.map((item) => {
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
