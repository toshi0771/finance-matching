'use client'
import Link from 'next/link'
import { useState } from 'react'
import { SignInButton, useUser } from '@clerk/nextjs'

const faqs = [
  { q: '利用料金はかかりますか？', a: 'ユーザー様の登録・問い合わせは完全無料です。費用は一切かかりません。' },
  { q: '個人情報は安全ですか？', a: '登録情報は問い合わせ先の金融会社にのみ開示されます。第三者への販売は一切行いません。' },
  { q: 'どんな金融会社に相談できますか？', a: '個人融資・法人融資・不動産担保融資・手形割引・ファクタリングなど多様なカテゴリの会社が登録されています。' },
  { q: '問い合わせ後の流れは？', a: '問い合わせ後、金融会社から直接ご連絡が届きます。その後は会社と直接面談・審査となります。' },
  { q: 'エリア外の会社にも問い合わせできますか？', a: 'はい、地図で大阪府内の金融会社を検索・問い合わせできます。' },
]

export default function UsersPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
const [sending, setSending] = useState(false)
const [sent, setSent] = useState(false)

const handleSubmit = async () => {
  if (!form.name || !form.email || !form.message) return
  setSending(true)
  try {
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, type: 'user' }),
    })
    setSent(true)
    setForm({ name: '', email: '', message: '' })
  } catch (e) {
    alert('送信に失敗しました。')
  } finally {
    setSending(false)
  }
}
  const { isSignedIn } = useUser()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section style={{ background: 'var(--navy)' }} className="py-20 px-6 text-center text-white">
        <h1 className="text-3xl font-bold mb-4">資金調達の悩みを、地図から解決</h1>
        <p className="text-lg opacity-80 mb-8 max-w-xl mx-auto">
          近くの金融会社をカテゴリ・レビューで比較。無料登録して、あなたに合った会社にすぐ問い合わせ。
        </p>
        {!isSignedIn && (
          <SignInButton mode="modal">
            <button style={{ background: 'var(--gold)', color: 'var(--navy)' }}
              className="px-8 py-3 rounded-full font-bold text-lg hover:opacity-90 transition">
              無料で始める
            </button>
          </SignInButton>
        )}
        {isSignedIn && (
          <Link href="/" style={{ background: 'var(--gold)', color: 'var(--navy)' }}
            className="px-8 py-3 rounded-full font-bold text-lg hover:opacity-90 transition inline-block">
            地図で会社を探す
          </Link>
        )}
      </section>

      {/* Benefits */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10" style={{ color: 'var(--navy)' }}>ユーザーのメリット</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: '地図で直感的に検索', desc: '近くの金融会社をマップ上で一目で確認。エリア・カテゴリで絞り込み可能。' },
            { title: 'レビューで安心選び', desc: '実際の利用者のレビューを参考に、信頼できる会社を選べます。' },
            { title: '無料で複数社に問い合わせ', desc: '登録無料・問い合わせ無料。複数社に同時に相談できます。' },
          ].map((b, i) => (
            <div key={i} className="text-center p-6 rounded-xl border border-gray-100 shadow-sm">
              
              <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--navy)' }}>{b.title}</h3>
              <p className="text-gray-600 text-sm">{b.desc}</p>
            </div>
          ))}
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
        <h2 className="text-2xl font-bold text-center mb-8" style={{ color: 'var(--navy)' }}>お問い合わせ</h2>
        <div className="space-y-4">
          <input className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"
            placeholder="お名前" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm"
            placeholder="メールアドレス" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <textarea className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm h-32"
            placeholder="お問い合わせ内容" value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
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
