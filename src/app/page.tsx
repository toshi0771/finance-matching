import { supabase, FinanceCompany } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import CompanySidebar from '@/components/CompanySidebar';

export const dynamic = 'force-dynamic';

async function getCompanies(): Promise<FinanceCompany[]> {
  const { data, error } = await supabase
    .from('finance_companies')
    .select(`
      id,
      name,
      area_code,
      lat,
      lng,
      description,
      show_reviews,
      is_active,
      company_categories(category)
    `)
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Failed to fetch companies:', error);
    return [];
  }

  return (data ?? []) as FinanceCompany[];
}

export default async function Home() {
  const companies = await getCompanies();

  return (
    <>
      <Navbar />
      <main
        className="flex flex-col"
        style={{ paddingTop: '4rem', height: '100dvh', overflow: 'hidden' }}
      >
        <div className="flex-1 min-h-0">
          <CompanySidebar companies={companies} />
        </div>
      </main>
    </>
  );
}
