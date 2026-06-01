import { currentUser } from '@clerk/nextjs/server';
import Navbar from '@/components/Navbar';
import SubscribeButton from '@/components/SubscribeButton';

export const metadata = { title: '料金プラン | MoneyFind' };

export default async function PricingPage() {
  const user = await currentUser();
  const isPaid = user?.publicMetadata?.company_plan === 'paid';

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4" style={{ background: 'var(--bg-page)' }}>
        <div className="max-w-4xl mx-auto">
          <h1
            className="text-3xl font-bold text-center mb-2"
            style={{ color: 'var(--navy)', fontFamily: 'var(--font-display), serif' }}
          >
            料金プラン
          </h1>
          <p className="text-center text-sm mb-12" style={{ color: 'var(--text-muted)' }}>
            貴社のニーズに合わせたプランをお選びください
          </p>

          <div className="grid md:grid-cols-2 gap-6 items-start">
            {/* Free plan */}
            <div
              className="rounded-2xl border p-8"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: 'var(--text-muted)' }}
              >
                無料登録プラン
              </p>
              <div className="mb-1">
                <span className="text-4xl font-bold" style={{ color: 'var(--navy)' }}>¥5,000</span>
                <span className="text-sm ml-1" style={{ color: 'var(--text-muted)' }}>/ 件</span>
              </div>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                問い合わせが来るたびに手数料が発生
              </p>
              <ul className="space-y-3 text-sm mb-8" style={{ color: 'var(--text-body)' }}>
                <li className="flex gap-2 items-start">
                  <span style={{ color: 'var(--gold)' }}>✓</span>
                  初期費用・月額費用なし
                </li>
                <li className="flex gap-2 items-start">
                  <span style={{ color: 'var(--gold)' }}>✓</span>
                  掲載情報の基本管理
                </li>
                <li className="flex gap-2 items-start">
                  <span style={{ color: 'var(--text-muted)' }}>—</span>
                  <span style={{ color: 'var(--text-muted)' }}>問い合わせごとに5,000円の手数料</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span style={{ color: 'var(--text-muted)' }}>—</span>
                  <span style={{ color: 'var(--text-muted)' }}>問い合わせ者の連絡先は非表示</span>
                </li>
              </ul>
              <div
                className="rounded-lg py-2.5 text-center text-sm font-medium"
                style={{ background: 'var(--bg-page)', color: 'var(--text-muted)' }}
              >
                デフォルトプラン
              </div>
            </div>

            {/* Paid plan */}
            <div
              className="rounded-2xl border-2 p-8 relative"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--gold)' }}
            >
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold whitespace-nowrap"
                style={{ background: 'var(--gold)', color: 'var(--navy)' }}
              >
                おすすめ
              </span>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: 'var(--gold)' }}
              >
                有料サブスクプラン
              </p>
              <div className="mb-1">
                <span className="text-4xl font-bold" style={{ color: 'var(--navy)' }}>¥10,000</span>
                <span className="text-sm ml-1" style={{ color: 'var(--text-muted)' }}>/ 月</span>
              </div>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                何件来ても手数料なし
              </p>
              <ul className="space-y-3 text-sm mb-8" style={{ color: 'var(--text-body)' }}>
                <li className="flex gap-2 items-start">
                  <span style={{ color: 'var(--gold)' }}>✓</span>
                  問い合わせ手数料 <strong>0円</strong>
                </li>
                <li className="flex gap-2 items-start">
                  <span style={{ color: 'var(--gold)' }}>✓</span>
                  専用ダッシュボード
                </li>
                <li className="flex gap-2 items-start">
                  <span style={{ color: 'var(--gold)' }}>✓</span>
                  問い合わせ者の氏名・連絡先を確認可能
                </li>
                <li className="flex gap-2 items-start">
                  <span style={{ color: 'var(--gold)' }}>✓</span>
                  掲載情報のリアルタイム編集
                </li>
              </ul>

              {isPaid ? (
                <a
                  href="/company/dashboard"
                  className="block rounded-lg py-3 text-center text-sm font-bold"
                  style={{ background: 'var(--navy)', color: 'white' }}
                >
                  ダッシュボードへ →
                </a>
              ) : (
                <SubscribeButton />
              )}
            </div>
          </div>

          <p className="text-center text-xs mt-8" style={{ color: 'var(--text-muted)' }}>
            ※ サブスクは Stripe による安全な決済です。いつでもキャンセル可能です。
          </p>
        </div>
      </main>
    </>
  );
}
