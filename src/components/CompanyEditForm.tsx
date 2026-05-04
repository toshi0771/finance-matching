'use client';

import { useActionState } from 'react';
import { updateCompanyInfo, type CompanyUpdateState } from '@/app/actions/company';

type Props = {
  company: {
    name: string;
    description: string | null;
    area_code: string | null;
    show_reviews: boolean;
  };
};

const initialState: CompanyUpdateState = {};

export default function CompanyEditForm({ company }: Props) {
  const [state, formAction, isPending] = useActionState(updateCompanyInfo, initialState);

  return (
    <form action={formAction} className="space-y-4 max-w-lg">
      {state.success && (
        <p className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
          会社情報を更新しました
        </p>
      )}
      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
          会社名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          defaultValue={company.name}
          required
          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
          style={{ borderColor: 'var(--border)', color: 'var(--text-body)' }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
          会社概要
        </label>
        <textarea
          name="description"
          defaultValue={company.description ?? ''}
          rows={4}
          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
          style={{ borderColor: 'var(--border)', color: 'var(--text-body)' }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
          エリアコード
        </label>
        <input
          type="text"
          name="area_code"
          defaultValue={company.area_code ?? ''}
          placeholder="例: 06"
          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: 'var(--border)', color: 'var(--text-body)' }}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="show_reviews"
          name="show_reviews"
          value="true"
          defaultChecked={company.show_reviews}
          className="h-4 w-4 rounded"
        />
        <label htmlFor="show_reviews" className="text-sm" style={{ color: 'var(--text-body)' }}>
          レビューを公開する
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg px-6 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50 cursor-pointer"
        style={{ background: 'var(--navy)', color: 'white' }}
      >
        {isPending ? '保存中...' : '変更を保存'}
      </button>
    </form>
  );
}
