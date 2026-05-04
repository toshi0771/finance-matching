'use client';

import { useTransition } from 'react';
import { toggleCompanyVisibility } from '../actions';

export default function CompanyVisibilityToggle({
  companyId,
  isActive,
}: {
  companyId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(() => toggleCompanyVisibility(companyId, !isActive));
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 disabled:opacity-50 ${
        isActive ? 'bg-green-500' : 'bg-gray-300'
      }`}
      title={isActive ? '非表示にする' : '表示する'}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          isActive ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
