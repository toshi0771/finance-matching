'use client';

import { useEffect, useRef, useActionState, useState } from 'react';
import { SignInButton, useUser } from '@clerk/nextjs';
import { supabase, FinanceCompany, Review } from '@/lib/supabase';
import { submitInquiry, InquiryState } from '@/app/actions/inquiry';

const CATEGORY_BADGE: Record<string, { bg: string; text: string }> = {
  個人融資:       { bg: '#DBEAFE', text: '#1E40AF' },
  法人融資:       { bg: '#EDE9FE', text: '#5B21B6' },
  不動産担保融資: { bg: '#FEF3C7', text: '#92400E' },
  手形割引:       { bg: '#D1FAE5', text: '#065F46' },
  ファクタリング: { bg: '#FEE2E2', text: '#991B1B' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

type Props = {
  company: FinanceCompany;
  onClose: () => void;
};

const inquiryInitial: InquiryState = {};

export default function CompanyDetail({ company, onClose }: Props) {
  const { isSignedIn } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);

  const boundSubmit = submitInquiry.bind(null, company.id);
  const [inquiryState, inquiryAction, isSubmitting] = useActionState(
    boundSubmit,
    inquiryInitial,
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isSignedIn || !company.show_reviews) return;

    setReviewsLoading(true);
    supabase
      .from('reviews')
      .select('id, comment, created_at')
      .eq('company_id', company.id)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setReviews((data ?? []) as Review[]);
        setReviewsLoading(false);
      });
  }, [company.id, isSignedIn, company.show_reviews]);

  // Reset inquiry form when company changes
  useEffect(() => {
    setShowInquiry(false);
  }, [company.id]);

  function handleInquiryOpen() {
    setShowInquiry(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: 'var(--bg-card)',
        borderLeft: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-start justify-between gap-3"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--navy)' }}
      >
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-base leading-snug text-white">
            {company.name}
          </h2>
          {company.area_code && (
            <p className="text-xs mt-0.5 text-white/60">{company.area_code}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="閉じる"
        >
          ✕
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* Category badges */}
        <div className="px-5 pt-4 pb-0">
          <div className="flex flex-wrap gap-1.5">
            {company.company_categories.map(cc => {
              const badge = CATEGORY_BADGE[cc.category] ?? {
                bg: 'var(--border)',
                text: 'var(--text-muted)',
              };
              return (
                <span
                  key={cc.category}
                  className="rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{ background: badge.bg, color: badge.text }}
                >
                  {cc.category}
                </span>
              );
            })}
          </div>
        </div>

        {/* Description */}
        {company.description && (
          <div className="px-5 pt-4">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
              {company.description}
            </p>
          </div>
        )}

        {/* Info grid */}
        <div className="px-5 pt-5">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            基本情報
          </p>
          <div
            className="rounded-lg overflow-hidden text-sm"
            style={{ border: '1px solid var(--border)' }}
          >
            {[
              { label: '会社名', value: company.name },
              { label: 'エリア', value: company.area_code ?? '—' },
              {
                label: 'カテゴリ',
                value:
                  company.company_categories.map(c => c.category).join('・') || '—',
              },
            ].map(({ label, value }, i) => (
              <div
                key={label}
                className="flex gap-3 px-4 py-2.5"
                style={{
                  background: i % 2 === 0 ? 'var(--bg-page)' : 'var(--bg-card)',
                }}
              >
                <span
                  className="w-20 shrink-0 font-medium text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {label}
                </span>
                <span style={{ color: 'var(--text-body)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews section */}
        <div className="px-5 pt-6 pb-2">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            レビュー
          </p>

          {!isSignedIn ? (
            <div
              className="rounded-xl p-5 text-center"
              style={{
                background: 'var(--bg-page)',
                border: '1px solid var(--border)',
              }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-body)' }}>
                登録してレビューを見る
              </p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                無料会員登録でユーザーのリアルな声を確認できます
              </p>
              <SignInButton mode="modal">
                <button
                  className="rounded-full px-5 py-2 text-sm font-medium transition-colors"
                  style={{ background: 'var(--gold)', color: 'var(--navy)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--gold-light)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--gold)')}
                >
                  無料登録 / ログイン
                </button>
              </SignInButton>
            </div>
          ) : !company.show_reviews ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              この会社のレビューは非公開です
            </p>
          ) : reviewsLoading ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>読み込み中…</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>まだレビューはありません</p>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map(r => (
                <div
                  key={r.id}
                  className="rounded-lg px-4 py-3"
                  style={{
                    background: 'var(--bg-page)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
                    {r.comment}
                  </p>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(r.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer: CTA / Inquiry form */}
      <div className="px-5 py-4" style={{ borderTop: '1px solid var(--border)' }}>
        {!isSignedIn ? (
          /* Guest: prompt login */
          <SignInButton mode="modal">
            <button
              className="w-full rounded-full py-3 text-sm font-semibold transition-colors"
              style={{ background: 'var(--gold)', color: 'var(--navy)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--gold-light)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--gold)')}
            >
              ログインして問い合わせする
            </button>
          </SignInButton>
        ) : inquiryState.success ? (
          /* Success */
          <div
            className="rounded-xl px-4 py-4 text-center"
            style={{ background: '#D1FAE5', border: '1px solid #6EE7B7' }}
          >
            <p className="text-sm font-semibold" style={{ color: '#065F46' }}>
              問い合わせを送信しました
            </p>
            <p className="text-xs mt-1" style={{ color: '#047857' }}>
              担当者よりご連絡いたします
            </p>
          </div>
        ) : inquiryState.duplicate ? (
          /* Already submitted */
          <div
            className="rounded-xl px-4 py-3 text-center"
            style={{ background: '#FEF3C7', border: '1px solid #FCD34D' }}
          >
            <p className="text-sm font-semibold" style={{ color: '#92400E' }}>
              この会社にはすでに問い合わせ済みです
            </p>
          </div>
        ) : !showInquiry ? (
          /* Initial CTA */
          <button
            className="w-full rounded-full py-3 text-sm font-semibold transition-colors"
            style={{ background: 'var(--gold)', color: 'var(--navy)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--gold-light)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--gold)')}
            onClick={handleInquiryOpen}
          >
            問い合わせする
          </button>
        ) : (
          /* Inquiry form */
          <form action={inquiryAction} className="flex flex-col gap-3">
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              相談内容
            </p>
            <textarea
              ref={textareaRef}
              name="message"
              rows={4}
              placeholder="ご相談内容をご記入ください"
              required
              className="w-full rounded-lg text-sm resize-none"
              style={{
                border: '1px solid var(--border)',
                background: 'var(--bg-page)',
                color: 'var(--text-body)',
                padding: '0.625rem 0.75rem',
                outline: 'none',
                fontFamily: 'inherit',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />

            {inquiryState.error && !inquiryState.duplicate && (
              <p
                className="text-xs rounded-lg px-3 py-2"
                style={{ background: '#FEE2E2', color: '#991B1B' }}
              >
                {inquiryState.error}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowInquiry(false)}
                className="flex-1 rounded-full py-2.5 text-sm font-medium transition-colors"
                style={{
                  background: 'var(--bg-page)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border)',
                }}
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-full py-2.5 text-sm font-semibold"
                style={{
                  background: isSubmitting ? 'var(--border)' : 'var(--gold)',
                  color: isSubmitting ? 'var(--text-muted)' : 'var(--navy)',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                {isSubmitting ? '送信中…' : '送信する'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
