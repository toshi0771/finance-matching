'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveProfile, ProfileState } from '@/app/actions/profile';

const PREFECTURES = [
  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県',
  '茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
  '新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県',
  '静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県',
  '奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県',
  '徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県',
  '熊本県','大分県','宮崎県','鹿児島県','沖縄県',
];

const initial: ProfileState = {};

export default function ProfileSetupForm() {
  const [state, action, isPending] = useActionState(saveProfile, initial);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.push('/');
    }
  }, [state.success, router]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-page)' }}
    >
      {/* Top bar */}
      <header
        className="h-16 flex items-center px-6"
        style={{ background: 'var(--navy)' }}
      >
        <span
          className="text-xl font-bold tracking-tight"
          style={{
            fontFamily: 'var(--font-playfair-display), serif',
            color: 'var(--gold)',
          }}
        >
          MoneyFind
        </span>
      </header>

      <main className="flex-1 flex items-start justify-center py-12 px-4">
        <div
          className="w-full max-w-lg rounded-2xl shadow-md p-8"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <h1
            className="text-xl font-bold mb-1"
            style={{ color: 'var(--text-body)' }}
          >
            プロフィール設定
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
            サービスをご利用いただくために追加情報を入力してください
          </p>

          <form action={action} className="flex flex-col gap-5">
            {/* Phone */}
            <Field label="電話番号" required>
              <input
                type="tel"
                name="phone"
                placeholder="090-0000-0000"
                required
                className="input-base"
              />
            </Field>

            {/* Age */}
            <Field label="年齢" required>
              <input
                type="number"
                name="age"
                placeholder="30"
                min={18}
                max={120}
                required
                className="input-base"
              />
            </Field>

            {/* Gender (optional) */}
            <Field label="性別" note="任意">
              <select name="gender" className="input-base">
                <option value="">選択しない</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
                <option value="other">その他</option>
              </select>
            </Field>

            {/* Prefecture */}
            <Field label="都道府県" required>
              <select name="prefecture" required className="input-base">
                <option value="">選択してください</option>
                {PREFECTURES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>

            {/* City */}
            <Field label="市区町村" required>
              <input
                type="text"
                name="city"
                placeholder="大阪市北区"
                required
                className="input-base"
              />
            </Field>

            {/* Occupation */}
            <Field label="職業" required>
              <input
                type="text"
                name="occupation"
                placeholder="会社員"
                required
                className="input-base"
              />
            </Field>

            {/* User type */}
            <Field label="利用区分" required>
              <div className="flex gap-3">
                {[
                  { value: 'individual', label: '個人' },
                  { value: 'individual_business', label: '個人事業主' },
                  { value: 'corporate', label: '法人' },
                ].map(opt => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="user_type"
                      value={opt.value}
                      required
                      className="accent-gold"
                    />
                    <span className="text-sm" style={{ color: 'var(--text-body)' }}>
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </Field>

            {/* Error */}
            {state.error && (
              <p
                className="text-sm rounded-lg px-4 py-3"
                style={{
                  background: '#FEE2E2',
                  color: '#991B1B',
                  border: '1px solid #FCA5A5',
                }}
              >
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-full py-3 text-sm font-semibold transition-colors mt-2"
              style={{
                background: isPending ? 'var(--border)' : 'var(--gold)',
                color: isPending ? 'var(--text-muted)' : 'var(--navy)',
                cursor: isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {isPending ? '保存中…' : '設定を完了して始める'}
            </button>
          </form>
        </div>
      </main>

      <style>{`
        .input-base {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--border);
          background: var(--bg-page);
          color: var(--text-body);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
        }
        .input-base:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--gold) 20%, transparent);
        }
        .accent-gold { accent-color: var(--gold); }
      `}</style>
    </div>
  );
}

function Field({
  label,
  required,
  note,
  children,
}: {
  label: string;
  required?: boolean;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--text-body)' }}>
        {label}
        {required && (
          <span className="text-xs rounded px-1 py-0.5" style={{ background: '#FEE2E2', color: '#991B1B' }}>
            必須
          </span>
        )}
        {note && (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>（{note}）</span>
        )}
      </label>
      {children}
    </div>
  );
}
