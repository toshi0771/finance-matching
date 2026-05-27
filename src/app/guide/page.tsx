'use client'
import Link from 'next/link'
import { SignInButton, useUser } from '@clerk/nextjs'

export default function GuidePage() {
  const { isSignedIn } = useUser()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section style={{ background: 'var(--navy)' }} className="py-20 px-6 text-center text-white">
        <h1 className="text-3xl font-bold mb-4">まず始めに</h1>
        <p className="text-lg opacity-80 max-w-xl mx-auto">
          FinanceMatchの使い方をご説明します。資金調達をお考えの方も、掲載をご検討の金融会社様も、まずこちらをご覧ください。
        </p>
      </section>

      {/* ユーザー向け */}
      <section className="py-16 px-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--navy)' }}>
          💰 資金調達をお考えの方へ
        </h2>
        <div className="space-y-6">
          {[
            { step: '1', title: '無料登録する', desc: '名前・メール・職業などを登録。登録は無料で1分で完了します。' },
            { step: '2', title: '地図で会社を探す', desc: '大阪府内の金融会社をカテゴリ・エリア・レビューで絞り込み。' },
            { step: '3', title: '気になる会社に問い合わせ', desc: '問い合わせはワンクリック。複数社に同時に送れます。' },
            { step: '4', title: '会社から連絡が届く', desc: '金融会社から直接ご連絡が届きます。あとは面談・審査へ進むだけ。' },
          ].map((s) => (
            <div key={s.step} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                style={{ background: 'var(--navy)' }}>
                {s.step}
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--navy)' }}>{s.title}</h3>
                <p className="text-gray-600 text-sm">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 flex gap-4">
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button style={{ background: 'var(--gold)', color: 'var(--navy)' }}
                className="px-8 py-3 rounded-full font-bold hover:opacity-90 transition">
                無料登録して始める
              </button>
            </SignInButton>
          ) : (
            <Link href="/" style={{ background: 'var(--gold)', color: 'var(--navy)' }}
              className="px-8 py-3 rounded-full font-bold hover:opacity-90 transition inline-block">
              地図で会社を探す
            </Link>
          )}
          <Link href="/users" style={{ color: 'var(--navy)' }}
            className="px-8 py-3 rounded-full font-bold border-2 hover:opacity-70 transition inline-block"
            style={{ borderColor: 'var(--navy)', color: 'var(--navy)' }}>
            詳しく見る
          </Link>
        </div>
      </section>

      <hr className="max-w-3xl mx-auto border-gray-200" />

      {/* 業者向け */}
      <section className="py-16 px-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--navy)' }}>
          🏢 金融会社様へ
        </h2>
        <div className="space-y-6">
          {[
            { step: '1', title: '掲載登録する', desc: '会社情報・カテゴリ・営業エリアを登録。無料プランからスタートできます。' },
            { step: '2', title: '地図に掲載される', desc: '大阪府内のユーザーがあなたの会社を地図上で見つけます。' },
            { step: '3', title: '問い合わせが届く', desc: '氏名・職業・連絡先登録済みの質の高いリードが届きます。' },
            { step: '4', title: '面談・審査へ', desc: '直接連絡を取り、面談・審査を経て成約へ。顧客情報はダッシュボードに蓄積されます。' },
          ].map((s) => (
            <div key={s.step} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                style={{ background: 'var(--gold)', color: 'var(--navy)' }}>
                {s.step}
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--navy)' }}>{s.title}</h3>
                <p className="text-gray-600 text-sm">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Link href="/companies" style={{ background: 'var(--navy)', color: 'white' }}
            className="px-8 py-3 rounded-full font-bold hover:opacity-90 transition inline-block">
            掲載について詳しく見る
          </Link>
        </div>
      </section>
    </div>
  )
}