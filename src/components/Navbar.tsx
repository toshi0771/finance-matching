'use client';

import { SignInButton, UserButton, useUser } from '@clerk/nextjs';

export default function Navbar() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-6 gap-8"
      style={{ background: 'var(--navy)' }}
    >
      <a href="/" className="flex items-center gap-2.5 shrink-0">
        <span
          className="text-xl font-bold tracking-tight"
          style={{
            fontFamily: 'var(--font-playfair-display), serif',
            color: 'var(--gold)',
          }}
        >
          FinanceMatch
        </span>
        <span className="text-xs font-medium text-white/50 hidden sm:block">
          大阪金融マッチング
        </span>
      </a>

      <nav className="flex items-center gap-6 ml-4 flex-1">
        <a
          href="/users"
          className="text-sm font-medium text-white/70 transition-colors hover:text-white"
        >
          ユーザー様へ
        </a>
        <a
          href="/companies"
          className="text-sm font-medium text-white/70 transition-colors hover:text-white"
        >
          業者様へ
        </a>
      </nav>

      <div className="shrink-0 flex items-center">
        {!isLoaded ? (
          /* skeleton while Clerk loads */
          <div
            className="rounded-full px-5 py-2 text-sm font-medium opacity-40"
            style={{ background: 'var(--gold)', color: 'var(--navy)' }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </div>
        ) : isSignedIn ? (
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-9 h-9 ring-2 ring-gold/60',
              },
            }}
          />
        ) : (
          <SignInButton>
            <button
              className="rounded-full px-5 py-2 text-sm font-medium transition-colors"
              style={{ background: 'var(--gold)', color: 'var(--navy)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--gold-light)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--gold)')}
            >
              登録 / ログイン
            </button>
          </SignInButton>
        )}
      </div>
    </header>
  );
}
