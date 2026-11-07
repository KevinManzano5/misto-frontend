import type { Metadata } from 'next';
import Sidebar from '@/components/Sidebar';
import UserMenu from '@/components/UserMenu';
import AdminSettingsTabs from './AdminSettingsTabs';

export const metadata: Metadata = {
  title: 'Configuración de aplicación | Misto',
};

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300 font-sans flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <nav className="border-b border-neutral-800 bg-neutral-950 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Misto
          </h1>
          <UserMenu />
        </nav>

        <main className="max-w-5xl mx-auto px-6 py-12 w-full">
          <h1 className="text-2xl font-medium text-white tracking-tight mb-8">
            Configuración de aplicación
          </h1>

          <AdminSettingsTabs />
        </main>
      </div>
    </div>
  );
}
