import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { createAdminClient } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import CompanyEditForm from '@/components/CompanyEditForm';

export const metadata = { title: 'ダッシュボード | MoneyFind' };

const STATUS_LABEL: Record<string, string> = {
  active: '有効',
  cancelled: 'キャンセル済み',
  canceled: 'キャンセル済み',
  past_due: '支払い遅延',
  unpaid: '未払い',
  trialing: 'トライアル中',
  paused: '一時停止中',
  incomplete: '処理中',
  incomplete_expired: '処理期限切れ',
};

const INQUIRY_STATUS_LABEL: Record<string, string> = {
  pending: '未対応',
  contacted: '対応済み',
  closed: 'クローズ',
};

type InquiryRow = {
  id: string;
  created_at: string;
  status: string;
  message: string | null;
  users: {
    name: string | null;
    email: string;
    phone: string | null;
  }[] | null;
};

export default async function CompanyDashboard() {
  const user = await currentUser();

  console.log('[dashboard] userId:', user?.id ?? 'null');
  console.log('[dashboard] publicMetadata:', JSON.stringify(user?.publicMetadata ?? {}));
  console.log('[dashboard] company_plan value:', user?.publicMetadata?.company_plan);
  console.log('[dashboard] plan check result:', user?.publicMetadata?.company_plan !== 'paid');

  if (!user || user.publicMetadata?.company_plan !== 'paid') {
    console.log('[dashboard] → redirect to /company/pricing (plan check failed)');
    redirect('/company/pricing');
  }

  const admin = createAdminClient();

  const { data: company, error: companyError } = await admin
    .from('finance_companies')
    .select('id, name, description, area_code, show_reviews')
    .eq('clerk_user_id', user.id)
    .single();

  console.log('[dashboard] company:', company?.id ?? 'null', 'error:', companyError?.code ?? 'none');

  const [{ data: inquiries }, { data: plan }] = company
    ? await Promise.all([
        admin
          .from('inquiries')
          .select('id, created_at, status, message, users(name, email, phone)')
          .eq('company_id', company.id)
          .order('created_at', { ascending: false })
          .limit(50),
        admin
          .from('company_plans')
          .select('stripe_subscription_id, status, started_at')
          .eq('company_id', company.id)
          .eq('status', 'active')
          .maybeSingle(),
      ])
    : [{ data: null }, { data: null }];

  let nextBillingDate: Date | null = null;
  let subscriptionStatus: string | null = plan?.status ?? null;

  if (plan?.stripe_subscription_id) {
    try {
      const sub = await stripe.subscriptions.retrieve(plan.stripe_subscription_id);
      subscriptionStatus = sub.status;
      const firstItem = sub.items.data[0];
      if (firstItem) {
        nextBillingDate = new Date(firstItem.current_period_end * 1000);
      }
    } catch (err) {
      console.error('[dashboard] stripe subscription fetch:', err);
    }
  }

  const isHealthy = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4" style={{ background: 'var(--bg-page)' }}>
        <div className="max-w-5xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>
            {company ? (company.name as string) : user.fullName ?? user.id} — ダッシュボード
          </h1>

          {!company && (
            <div
              className="rounded-2xl border p-4 text-sm"
              style={{ background: '#fffbeb', borderColor: '#fcd34d', color: '#92400e' }}
            >
              会社情報がまだ登録されていません。管理者に連絡するか、会社情報を登録してください。
            </div>
          )}

          {/* Subscription status */}
          <section
            className="rounded-2xl border p-6"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--navy)' }}>
              サブスクリプション状況
            </h2>
            {plan ? (
              <dl className="grid sm:grid-cols-3 gap-6 text-sm">
                <div>
                  <dt className="font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                    ステータス
                  </dt>
                  <dd
                    className="font-semibold"
                    style={{ color: isHealthy ? '#16a34a' : '#dc2626' }}
                  >
                    {STATUS_LABEL[subscriptionStatus ?? ''] ?? subscriptionStatus}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                    月額料金
                  </dt>
                  <dd className="font-semibold" style={{ color: 'var(--text-body)' }}>
                    ¥10,000
                  </dd>
                </div>
                <div>
                  <dt className="font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                    次回請求日
                  </dt>
                  <dd className="font-semibold" style={{ color: 'var(--text-body)' }}>
                    {nextBillingDate
                      ? nextBillingDate.toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '—'}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                プラン情報が見つかりません
              </p>
            )}
          </section>

          {/* Company info edit */}
          {company && (
            <section
              className="rounded-2xl border p-6"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--navy)' }}>
                掲載情報の編集
              </h2>
              <CompanyEditForm
                company={{
                  name: company.name as string,
                  description: company.description as string | null,
                  area_code: company.area_code as string | null,
                  show_reviews: company.show_reviews as boolean,
                }}
              />
            </section>
          )}

          {/* Inquiries list */}
          {company && (<section
            className="rounded-2xl border p-6"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--navy)' }}>
              問い合わせ一覧
              {inquiries && (
                <span
                  className="ml-2 text-sm font-normal"
                  style={{ color: 'var(--text-muted)' }}
                >
                  ({inquiries.length}件)
                </span>
              )}
            </h2>
            {inquiries && inquiries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <th
                        className="text-left py-2 pr-4 font-medium"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        ユーザー名
                      </th>
                      <th
                        className="text-left py-2 pr-4 font-medium"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        連絡先
                      </th>
                      <th
                        className="text-left py-2 pr-4 font-medium"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        日時
                      </th>
                      <th
                        className="text-left py-2 font-medium"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        ステータス
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(inquiries as unknown as InquiryRow[]).map(inquiry => {
                      const u = inquiry.users?.[0] ?? null;
                      return (
                      <tr
                        key={inquiry.id}
                        className="border-b last:border-0"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <td className="py-3 pr-4" style={{ color: 'var(--text-body)' }}>
                          {u?.name ?? '—'}
                        </td>
                        <td className="py-3 pr-4" style={{ color: 'var(--text-body)' }}>
                          <div>{u?.email ?? '—'}</div>
                          {u?.phone && (
                            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                              {u.phone}
                            </div>
                          )}
                        </td>
                        <td
                          className="py-3 pr-4 whitespace-nowrap"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {new Date(inquiry.created_at).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-3" style={{ color: 'var(--text-muted)' }}>
                          {INQUIRY_STATUS_LABEL[inquiry.status] ?? inquiry.status}
                        </td>
                      </tr>
                    );})}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                まだ問い合わせはありません
              </p>
            )}
          </section>)}
        </div>
      </main>
    </>
  );
}
