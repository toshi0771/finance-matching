import { createAdminClient } from '@/lib/supabase';
import CompanyVisibilityToggle from './CompanyVisibilityToggle';

export const metadata = { title: '金融会社管理 | Admin' };

type Company = {
  id: string;
  name: string;
  area_code: string | null;
  is_active: boolean;
  company_categories: { category: string }[];
};

async function getCompanies(): Promise<Company[]> {
  const client = createAdminClient();
  const { data, error } = await client
    .from('finance_companies')
    .select('id, name, area_code, is_active, company_categories(category)')
    .order('name');

  if (error) {
    console.error('companies fetch error:', error.message);
    return [];
  }
  return (data ?? []) as Company[];
}

export default async function CompaniesPage() {
  const companies = await getCompanies();

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-4">金融会社管理</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['会社名', 'エリア', 'カテゴリ', '表示'].map((h) => (
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
            {companies.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-400">
                  データがありません
                </td>
              </tr>
            )}
            {companies.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-gray-800">{c.name}</td>
                <td className="px-5 py-3 text-sm text-gray-500">{c.area_code ?? '—'}</td>
                <td className="px-5 py-3 text-sm text-gray-500">
                  {c.company_categories.length > 0
                    ? c.company_categories.map((cat) => cat.category).join('、')
                    : '—'}
                </td>
                <td className="px-5 py-3">
                  <CompanyVisibilityToggle companyId={c.id} isActive={c.is_active} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
