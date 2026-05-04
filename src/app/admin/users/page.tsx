import { createAdminClient } from '@/lib/supabase';

export const metadata = { title: 'ユーザー管理 | Admin' };

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  created_at: string;
  user_type: string | null;
  role: string;
};

const userTypeLabels: Record<string, string> = {
  individual: '個人',
  corporate: '法人',
};

const roleLabels: Record<string, string> = {
  user: '一般',
  admin: '管理者',
};

async function getUsers(): Promise<UserRow[]> {
  const client = createAdminClient();
  const { data, error } = await client
    .from('users')
    .select('id, name, email, created_at, user_type, role')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('users fetch error:', error.message);
    return [];
  }
  return (data ?? []) as UserRow[];
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-4">ユーザー管理</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['名前', 'メール', '登録日', 'プラン', 'ロール'].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">
                  データがありません
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-gray-800">
                  {u.name ?? '—'}
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">{u.email}</td>
                <td className="px-5 py-3 text-sm text-gray-500">
                  {new Date(u.created_at).toLocaleDateString('ja-JP')}
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">
                  {u.user_type ? (userTypeLabels[u.user_type] ?? u.user_type) : '—'}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                      u.role === 'admin'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {roleLabels[u.role] ?? u.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
