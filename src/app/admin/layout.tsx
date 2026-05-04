import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AdminSidebar from './AdminSidebar';

export const metadata = { title: '運営管理画面' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user || user.publicMetadata?.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-bold text-gray-800">運営管理画面</h1>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
