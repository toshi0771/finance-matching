'use client'
import Link from 'next/link'
import { useState } from 'react'

const faqs = [
  { q: '掲載費用はかかりますか？', a: '無料プランは問い合わせ1件あたりの手数料制です。月額サブスクプランではダッシュボード機能が使えます。' },
  { q: '問い合わせはどのように届きますか？', a: 'ユーザーが問い合わせを送ると、登録メールアドレスに通知が届きます。ダッシュボードでも管理できます。' },
  { q: 'どんな金融会社が登録できますか？', a: '個人融資・法人融資・不動産担保融資・手形割引・ファクタリングなど、幅広い金融サービスの会社様が対象です。' },
  { q: '成約しなかった場合も手数料はかかりますか？', a: '問い合わせ受信時のみ費用が発生します。成約・不成約は問いません。' },
  { q: '掲載情報は自分で管理できますか？', a: 'サブスクプランではダッシュボードから会社情報・カテゴリ・営業エリアを自由に編集できます。' },
]

export default function CompaniesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [form, setForm] = useState({ company: '', name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)
const [sent, setSent] = useState(false)

const handleSubmit = async () => {
  if (!form.name || !form.email || !form.message) return
  setSending(true)
  try {
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, type: 'company' }),
    })
    setSent(true)
    setForm({ company: '', name: '', email: '', message: '' })
  } catch (e) {
    alert('送信に失敗しました。')
  } finally {
    setSending(false)
  }
}
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section style={{ background: 'var(--navy)' }} className="py-20 px-6 text-center text-white">
        <h1 className="text-3xl font-bold mb-4">新規顧客を、地図から獲得する</h1>
        <p className="text-lg opacity-80 mb-8 max-w-xl mx-auto">
          資金を必要とするユーザーがあなたの会社を見つけます。掲載無料で始めて、問い合わせが届いたら手数料。成果報酬型だから安心。
        </p>
        <Link href="/company/pricing"
          style={{ background: 'var(--gold)', color: 'var(--navy)' }}
          className="px-8 py-3 rounded-full font-bold text-lg hover:opacity-90 transition inline-block">
          掲載プランを見る
        </Link>
      </section>

      {/* Benefits */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10" style={{ color: 'var(--navy)' }}>掲載するメリット</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: '地図で地域集客', desc: 'エリアを絞って近隣ユーザーへアプローチ。営業エリアに合った見込み顧客が届きます。' },
            { title: '質の高いリード', desc: '氏名・年齢・職業・連絡先登録済みのユーザーから問い合わせが来るため、商談効率が高い。' },
            { title: '顧客データが蓄積', desc: '成約した顧客情報がダッシュボードに蓄積。リピート営業・分析に活用できます。' },
          ].map((b, i) => (
            <div key={i} className="text-center p-6 rounded-xl border border-gray-100 shadow-sm">
              
              <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--navy)' }}>{b.title}</h3>
              <p className="text-gray-600 text-sm">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 px-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10" style={{ color: 'var(--navy)' }}>料金プラン</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-2 border-gray-200 rounded-xl p-6">
            <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--navy)' }}>無料プラン</h3>
            <p className="text-3xl font-bold mb-1">¥0<span className="text-base font-normal">/月</span></p>
            <p className="text-sm text-gray-500 mb-4">問い合わせ受信１件につき5,000円</p>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>✅ 地図掲載</li>
              <li>✅ カテゴリ登録</li>
              <li>✅ 問い合わせ受信</li>
              <li>❌ ダッシュボード</li>
              <li>❌ レビュー管理</li>
            </ul>
          </div>
          <div className="border-2 rounded-xl p-6" style={{ borderColor: 'var(--gold)', background: 'var(--navy)' }}>
            <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--gold)' }}>サブスクプラン</h3>
            <p className="text-3xl font-bold text-white mb-1">¥10,000<span className="text-base font-normal">/月</span></p>
            <p className="text-sm opacity-60 text-white mb-4">月額固定 ・全機能利用可能</p>
            <ul className="text-sm text-white space-y-2">
              <li>✅ 地図掲載</li>
              <li>✅ カテゴリ登録</li>
              <li>✅ 問い合わせ受信</li>
              <li>✅ ダッシュボード</li>
              <li>✅ レビュー管理</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10" style={{ color: 'var(--navy)' }}>よくある質問</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
              <button className="w-full text-left px-5 py-4 font-medium flex justify-between items-center"
                style={{ color: 'var(--navy)' }}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {faq.q}
                <span>{openFaq === i ? '▲' : '▼'}</span>
              </button>
              {openFaq === i && (
                <div className="px-5 py-4 bg-gray-50 text-gray-700 text-sm">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-6 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8" style={{ color: 'var(--navy)' }}>掲載のお問い合わせ</h2>
        <div className="space-y-4">

        <input className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"
            placeholder="会社名" value={form.company}
            onChange={e => setForm({...form, company: e.target.value})} />
          <input className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"
            placeholder="担当者名" value={form.name}
            onChange={e => setForm({...form, name: e.target.value})} />
          <input className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"
            placeholder="メールアドレス" type="email" value={form.email}
            onChange={e => setForm({...form, email: e.target.value})} />
          <textarea className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm h-32"
            placeholder="お問い合わせ内容" value={form.message}
            onChange={e => setForm({...form, message: e.target.value})} />
          {sent ? (
                <p className="text-center text-green-600 font-bold">✅ 送信しました！担当者よりご連絡いたします。</p>
              ) : (
                <button style={{ background: 'var(--navy)', color: 'white' }}
                  className="w-full py-3 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50"
                  onClick={handleSubmit}
                  disabled={sending}>
                  {sending ? '送信中...' : '送信する'}
                </button>
              )}
        </div>
      </section>
    </div>
  )
}