'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase';

export type ProfileState = {
  error?: string;
  success?: boolean;
};

export async function saveProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const { userId } = await auth();
  if (!userId) return { error: 'ログインが必要です' };

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? '';

  const phone      = (formData.get('phone')      as string).trim();
  const ageStr     = (formData.get('age')         as string).trim();
  const gender     = (formData.get('gender')      as string).trim() || null;
  const prefecture = (formData.get('prefecture')  as string).trim();
  const city       = (formData.get('city')        as string).trim();
  const occupation = (formData.get('occupation')  as string).trim();
  const userTypeRaw = formData.get('user_type')   as string;

  if (!phone || !ageStr || !prefecture || !city || !occupation || !userTypeRaw) {
    return { error: '必須項目をすべて入力してください' };
  }

  const age = parseInt(ageStr, 10);
  if (isNaN(age) || age < 18 || age > 120) {
    return { error: '年齢は18〜120の範囲で入力してください' };
  }

  const userType: 'individual' | 'corporate' =
    userTypeRaw === 'corporate' ? 'corporate' : 'individual';

  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || null;

  const client = createAdminClient();
  const { error } = await client.from('users').upsert(
    {
      clerk_user_id: userId,
      name,
      email,
      phone,
      age,
      gender,
      prefecture,
      city,
      occupation,
      user_type: userType,
    },
    { onConflict: 'clerk_user_id' },
  );

  if (error) {
    console.error('[saveProfile] error:', JSON.stringify(error));
    return { error: 'プロフィールの保存に失敗しました' };
  }

  return { success: true };
}
