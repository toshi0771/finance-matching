'use client';

import { useState } from 'react';

export default function SubscribeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/create-subscription', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'エラーが発生しました');
        return;
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      setError('通信エラーが発生しました。再度お試しください。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error && (
        <p className="text-sm text-red-600 mb-2">{error}</p>
      )}
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full rounded-lg py-3 text-sm font-bold transition-opacity disabled:opacity-50 cursor-pointer"
        style={{ background: 'var(--gold)', color: 'var(--navy)' }}
      >
        {loading ? '処理中...' : 'サブスクに申し込む →'}
      </button>
    </div>
  );
}
