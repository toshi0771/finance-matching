'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { FinanceCompany } from '@/lib/supabase';
import CompanyDetail from './CompanyDetail';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

const CATEGORIES = [
  { value: 'all',         label: 'すべて' },
  { value: '個人融資',    label: '個人融資' },
  { value: '法人融資',    label: '法人融資' },
  { value: '不動産担保融資', label: '不動産担保融資' },
  { value: '手形割引',    label: '手形割引' },
  { value: 'ファクタリング', label: 'ファクタリング' },
];

const CATEGORY_BADGE: Record<string, { bg: string; text: string }> = {
  個人融資:       { bg: '#DBEAFE', text: '#1E40AF' },
  法人融資:       { bg: '#EDE9FE', text: '#5B21B6' },
  不動産担保融資: { bg: '#FEF3C7', text: '#92400E' },
  手形割引:       { bg: '#D1FAE5', text: '#065F46' },
  ファクタリング: { bg: '#FEE2E2', text: '#991B1B' },
};

type Props = {
  companies: FinanceCompany[];
};

export default function CompanySidebar({ companies }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const filtered =
    selectedCategory === 'all'
      ? companies
      : companies.filter(c =>
          c.company_categories.some(cc => cc.category === selectedCategory)
        );

  const selectedCompany = companies.find(c => c.id === selectedId) ?? null;

  function handleSelectCompany(id: string) {
    setSelectedId(prev => (prev === id ? null : id));
    const el = cardRefs.current.get(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function handleCloseDetail() {
    setSelectedId(null);
  }

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-0">
      {/* ── Map ── */}
      <div className="relative flex-1 min-h-[50vh] lg:min-h-0">
        <MapView
          companies={companies}
          selectedCategory={selectedCategory}
          onSelectCompany={handleSelectCompany}
          selectedId={selectedId}
        />
      </div>

      {/* ── Company list sidebar ── */}
      <aside
        className="w-full lg:w-[280px] lg:shrink-0 flex flex-col"
        style={{ background: 'var(--bg-page)', borderLeft: '1px solid var(--border)' }}
      >
        {/* Category filter */}
        <div
          className="px-4 pt-4 pb-3"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            カテゴリ
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className="rounded-full px-3 py-1 text-xs font-medium transition-all"
                  style={
                    isActive
                      ? { background: 'var(--gold)', color: 'var(--navy)' }
                      : { background: 'var(--border)', color: 'var(--text-muted)' }
                  }
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.background = '#CBD5E0';
                  }}
                  onMouseLeave={e => {
                    if (!isActive)
                      e.currentTarget.style.background = 'var(--border)';
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Company list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p
              className="text-sm text-center py-12"
              style={{ color: 'var(--text-muted)' }}
            >
              該当する会社がありません
            </p>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {filtered.map(company => {
                const isSelected = selectedId === company.id;
                return (
                  <div
                    key={company.id}
                    ref={el => {
                      if (el) cardRefs.current.set(company.id, el);
                      else cardRefs.current.delete(company.id);
                    }}
                    onClick={() => handleSelectCompany(company.id)}
                    className="mx-3 my-2 rounded-lg cursor-pointer transition-shadow"
                    style={{
                      background: 'var(--bg-card)',
                      padding: '12px 14px',
                      boxShadow: isSelected
                        ? '0 0 0 2px var(--gold)'
                        : '0 1px 3px rgba(0,0,0,0.06)',
                      borderLeft: isSelected
                        ? '3px solid var(--gold)'
                        : '3px solid transparent',
                    }}
                  >
                    <p
                      className="font-semibold text-sm leading-snug"
                      style={{ color: 'var(--text-body)' }}
                    >
                      {company.name}
                    </p>
                    {company.area_code && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {company.area_code}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {company.company_categories.map(cc => {
                        const badge = CATEGORY_BADGE[cc.category] ?? {
                          bg: 'var(--border)',
                          text: 'var(--text-muted)',
                        };
                        return (
                          <span
                            key={cc.category}
                            className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                            style={{ background: badge.bg, color: badge.text }}
                          >
                            {cc.category}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer count */}
        <div
          className="px-4 py-2.5 text-xs text-center"
          style={{
            borderTop: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}
        >
          {filtered.length} 件表示中
        </div>
      </aside>

      {/* ── Detail panel ── */}
      {selectedCompany && (
        <div
          className="w-full lg:w-[360px] lg:shrink-0 flex flex-col"
          style={{ borderLeft: '1px solid var(--border)' }}
        >
          <CompanyDetail company={selectedCompany} onClose={handleCloseDetail} />
        </div>
      )}
    </div>
  );
}
