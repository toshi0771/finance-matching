'use client';

import { useTransition } from 'react';
import { updateInquiryStatus } from '../actions';

type Status = 'pending' | 'contacted' | 'closed';

const statusLabels: Record<Status, string> = {
  pending: '未対応',
  contacted: '連絡済み',
  closed: 'クローズ',
};

const statusColors: Record<Status, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  closed: 'bg-gray-100 text-gray-600',
};

export default function InquiryStatusSelect({
  inquiryId,
  currentStatus,
}: {
  inquiryId: string;
  currentStatus: Status;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    startTransition(() => updateInquiryStatus(inquiryId, next));
  }

  return (
    <select
      defaultValue={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      className={`rounded px-2 py-1 text-xs font-medium border-0 cursor-pointer focus:ring-1 focus:ring-gray-400 ${statusColors[currentStatus]} disabled:opacity-50`}
    >
      {(Object.keys(statusLabels) as Status[]).map((s) => (
        <option key={s} value={s}>
          {statusLabels[s]}
        </option>
      ))}
    </select>
  );
}
