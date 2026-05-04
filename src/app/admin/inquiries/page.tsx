import { createAdminClient } from '@/lib/supabase';
import InquiryStatusSelect from './InquiryStatusSelect';

export const metadata = { title: '問い合わせ管理 | Admin' };

type Inquiry = {
  id: string;
  status: 'pending' | 'contacted' | 'closed';
  created_at: string;
  users: { name: string | null } | null;
  finance_companies: { name: string } | null;
  inquiry_fees: { status: 'pending' | 'paid' }[];
};

async function getInquiries(): Promise<Inquiry[]> {
  const client = createAdminClient();
  const { data, error } = await client
    .from('inquiries')
    .select('id, status, created_at, users(name), finance_companies(name), inquiry_fees(status)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('inquiries fetch error:', error.message);
    return [];
  }
  return (data ?? []) as unknown as Inquiry[];
}

function FeeStatusBadge({ fees }: { fees: { status: 'pending' | 'paid' }[] }) {
  const fee = fees[0];
  if (!fee) return <span className="text-xs text-gray-400">—</span>;
  return fee.status === 'paid' ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
      支払済
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
      未払い
    </span>
  );
}

export default async function InquiriesPage() {
  const inquiries = await getInquiries();

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-4">問い合わせ管理</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['会社名', 'ユーザー名', '送信日時', 'ステータス', '手数料'].map((h) => (
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
            {inquiries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">
                  データがありません
                </td>
              </tr>
            )}
            {inquiries.map((inq) => (
              <tr key={inq.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 text-sm text-gray-800">
                  {inq.finance_companies?.name ?? '—'}
                </td>
                <td className="px-5 py-3 text-sm text-gray-800">
                  {inq.users?.name ?? '—'}
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">
                  {new Date(inq.created_at).toLocaleString('ja-JP')}
                </td>
                <td className="px-5 py-3">
                  <InquiryStatusSelect inquiryId={inq.id} currentStatus={inq.status} />
                </td>
                <td className="px-5 py-3">
                  <FeeStatusBadge fees={inq.inquiry_fees} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
