'use client';

import { useState } from 'react';
import AdminUsersList from './AdminUsersList';
import AdminStoresList from './AdminStoresList';
import AdminPaymentMethodsSection from './AdminPaymentMethodsSection';

type Tab = 'users' | 'stores' | 'payment-methods';

const TABS: { id: Tab; label: string }[] = [
  { id: 'users', label: 'Usuarios' },
  { id: 'stores', label: 'Tiendas' },
  { id: 'payment-methods', label: 'Métodos de pago' },
];

export default function AdminSettingsTabs() {
  const [activeTab, setActiveTab] = useState<Tab>('users');

  return (
    <div>
      <div
        role="tablist"
        aria-label="Secciones de configuración"
        className="flex gap-1 border-b border-neutral-800 mb-8"
      >
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`text-sm font-medium px-4 py-2.5 -mb-px border-b-2 transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-500 ${
                isActive
                  ? 'border-white text-white'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'users' && (
        <section role="tabpanel">
          <p className="mb-6 text-neutral-400">
            Usuarios registrados en la plataforma.
          </p>
          <AdminUsersList />
        </section>
      )}

      {activeTab === 'stores' && (
        <section role="tabpanel">
          <p className="mb-6 text-neutral-400">
            Tiendas registradas en la plataforma.
          </p>
          <AdminStoresList />
        </section>
      )}

      {activeTab === 'payment-methods' && (
        <section role="tabpanel">
          <p className="mb-6 text-neutral-400">
            Métodos de pago habilitados globalmente en la plataforma.
          </p>
          <AdminPaymentMethodsSection />
        </section>
      )}
    </div>
  );
}
