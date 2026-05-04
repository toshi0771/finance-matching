'use server';

import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase';

export type InquiryState = {
  error?: string;
  success?: boolean;
  duplicate?: boolean;
};

export async function submitInquiry(
  companyId: string,
  _prev: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  const { userId } = await auth();
  if (!userId) return { error: 'ログインが必要です' };

  const message = (formData.get('message') as string).trim();
  if (!message) return { error: '相談内容を入力してください' };

  const client = createAdminClient();

  // Get the user's internal UUID from Supabase
  const { data: userData, error: userErr } = await client
    .from('users')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  if (userErr || !userData) {
    return { error: 'プロフィールが未登録です。先にプロフィールを設定してください' };
  }

  const userId_db = userData.id as string;

  // Duplicate check: same user × same company
  const { data: existing, error: dupErr } = await client
    .from('inquiries')
    .select('id')
    .eq('company_id', companyId)
    .eq('user_id', userId_db)
    .maybeSingle();

  if (dupErr) {
    console.error('inquiry duplicate check error:', dupErr.message);
    return { error: '重複チェックに失敗しました' };
  }

  if (existing) {
    return { duplicate: true, error: 'この会社にはすでに問い合わせ済みです' };
  }

  // Insert inquiry
  const { data: inquiry, error: insertErr } = await client
    .from('inquiries')
    .insert({
      company_id: companyId,
      user_id: userId_db,
      message,
      status: 'pending',
      is_duplicate: false,
    })
    .select('id')
    .single();

  if (insertErr || !inquiry) {
    console.error('inquiry insert error:', insertErr?.message);
    return { error: '問い合わせの送信に失敗しました' };
  }

  // Charge inquiry fee to the company via Stripe
  try {
    const { headers } = await import('next/headers');
    const headersList = await headers();
    const host = headersList.get('host') ?? 'localhost:3000';
    const protocol = host.startsWith('localhost') ? 'http' : 'https';
    await fetch(`${protocol}://${host}/api/stripe/create-inquiry-charge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inquiry_id: inquiry.id, company_id: companyId }),
    });
  } catch (err) {
    console.error('create-inquiry-charge call failed:', err);
    // Non-fatal: inquiry was saved; fee creation failure is logged
  }

  return { success: true };
}
