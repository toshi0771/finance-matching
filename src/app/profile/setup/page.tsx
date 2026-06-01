import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ProfileSetupForm from './ProfileSetupForm';

export const metadata = { title: 'プロフィール設定 | MoneyFind' };

export default async function ProfileSetupPage() {
  const { userId } = await auth();
  if (!userId) redirect('/');
  return <ProfileSetupForm />;
}
