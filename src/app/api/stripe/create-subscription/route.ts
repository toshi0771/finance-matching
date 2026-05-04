import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = createAdminClient();
  const { data: company } = await client
    .from('finance_companies')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  const companyId = (company?.id as string | undefined) ?? 'test-company';

  try {
    const origin = new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      subscription_data: {
        metadata: {
          ...(companyId !== 'test-company' && { company_id: companyId }),
          clerk_user_id: userId,
        },
      },
      success_url: `${origin}/company/dashboard`,
      cancel_url: `${origin}/company/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[create-subscription] Stripe error:', err);
    return NextResponse.json({ error: 'Stripeセッション作成に失敗しました' }, { status: 500 });
  }
}
