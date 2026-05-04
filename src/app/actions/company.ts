'use server';

import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase';

export type CompanyUpdateState = {
  error?: string;
  success?: boolean;
};

export async function updateCompanyInfo(
  _prev: CompanyUpdateState,
  formData: FormData,
): Promise<CompanyUpdateState> {
  const { userId } = await auth();
  if (!userId) return { error: 'ログインが必要です' };

  const name = (formData.get('name') as string).trim();
  const description = (formData.get('description') as string).trim() || null;
  const area_code = (formData.get('area_code') as string).trim() || null;
  const show_reviews = formData.get('show_reviews') === 'true';

  if (!name) return { error: '会社名は必須です' };

  const client = createAdminClient();
  const { error } = await client
    .from('finance_companies')
    .update({ name, description, area_code, show_reviews })
    .eq('clerk_user_id', userId);

  if (error) {
    console.error('[updateCompanyInfo]', error);
    return { error: '会社情報の更新に失敗しました' };
  }

  return { success: true };
}
