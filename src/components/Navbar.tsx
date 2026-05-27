'use client';

import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { useState } from 'react';

export default function Navbar() {
  const { isLoaded, isSignedIn } = useUser();
  const [showPopup, setShowPopup] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 gap-8"
      style={{ background: 'var(--navy)' }}
    >
      <a href="/" className="flex items-center gap-2.5 shrink-0">
        <span
          className="text-xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-playfair-display), serif', color: 'var(--gold)' }}
        >
          FinanceMatch
        </span>
        <span className="text-xs font-medium text-white/50 hidden sm:block">大阪金融マッチング</span>
      </a>

      <nav className="flex items-center gap-6 ml-4 flex-1">
        <a href="/users" className="text-sm font-medium text-white/70 transition-colors hover:text-white">
          ユーザー様へ
        </a>
        <a href="/companies" className="text-sm font-medium text-white/70 transition-colors hover:text-white">
          業者様へ
        </a>
        <a href="/guide" className="text-sm font-medium transition-colors hover:text-white"
          style={{ color: 'var(--gold)' }}>
          まず始めに
        </a>
      </nav>

      <div className="shrink-0 flex items-center">
        {!isLoaded ? (
          <div className="rounded-full px-5 py-2 text-sm font-medium opacity-40"
            style={{ background: 'var(--gold)', color: 'var(--navy)' }}>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </div>
        ) : isSignedIn ? (
          <UserButton appearance={{ elements: { avatarBox: 'w-9 h-9 ring-2 ring-gold/60' } }} />
        ) : (
          <button
            className="rounded-full px-5 py-2 text-sm font-medium transition-colors"
            style={{ background: 'var(--gold)', color: 'var(--navy)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--gold-light)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--gold)')}
            onClick={() => setShowPopup(true)}
          >
            登録 / ログイン
          </button>
        )}
      </div>

      {/* ポップアップ */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowPopup(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-2 text-center" style={{ color: 'var(--navy)' }}>
              FinanceMatchへようこそ
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              初めての方は新規登録、すでにアカウントをお持ちの方はログインへ
            </p>
            <div className="space-y-3">
              <SignUpButton mode="modal">
                <button className="w-full py-3 rounded-xl font-bold text-sm transition hover:opacity-90"
                  style={{ background: 'var(--navy)', color: 'white' }}
                  onClick={() => setShowPopup(false)}>
                  🆕 新規登録（無料）
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="w-full py-3 rounded-xl font-bold text-sm transition hover:opacity-90"
                  style={{ background: 'var(--gold)', color: 'var(--navy)' }}
                  onClick={() => setShowPopup(false)}>
                  🔑 ログイン
                </button>
              </SignInButton>
            </div>
            <button className="mt-4 w-full text-xs text-gray-400 hover:text-gray-600 transition"
              onClick={() => setShowPopup(false)}>
              閉じる
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
