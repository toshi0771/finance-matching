'use server';

import { currentUser } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

async function assertAdmin() {
  const user = await currentUser();
  if (!user || user.publicMetadata?.role !== 'admin') {
    throw new Error('Unauthorized');
  }
}

export async function updateInquiryStatus(inquiryId: string, status: string) {
  await assertAdmin();
  const client = createAdminClient();
  const { error } = await client
    .from('inquiries')
    .update({ status })
    .eq('id', inquiryId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/inquiries');
}

export async function toggleCompanyVisibility(companyId: string, isActive: boolean) {
  await assertAdmin();
  const client = createAdminClient();
  const { error } = await client
    .from('finance_companies')
    .update({ is_active: isActive })
    .eq('id', companyId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/companies');
}
