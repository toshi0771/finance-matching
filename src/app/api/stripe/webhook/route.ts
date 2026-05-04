import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    console.log('[webhook] payment_intent.succeeded received. paymentIntent.id =', paymentIntent.id);
    console.log('[webhook] Expected stripe_invoice_id in DB: pi_3TRRkbF0hSeYxeF30jZYD387');
    console.log('[webhook] IDs match?', paymentIntent.id === 'pi_3TRRkbF0hSeYxeF30jZYD387');

    const client = createAdminClient();

    // UPDATE前にレコードの存在確認
    const { data: existing, error: fetchError } = await client
      .from('inquiry_fees')
      .select('id, status, stripe_invoice_id')
      .eq('stripe_invoice_id', paymentIntent.id);

    if (fetchError) {
      console.error('[webhook] inquiry_fees fetch error:', fetchError.code, fetchError.message);
    } else {
      console.log('[webhook] inquiry_fees rows matching stripe_invoice_id:', existing?.length ?? 0, existing);
    }

    const { error, count } = await client
      .from('inquiry_fees')
      .update({ status: 'paid', paid_at: new Date().toISOString() }, { count: 'exact' })
      .eq('stripe_invoice_id', paymentIntent.id);

    if (error) {
      console.error('[webhook] inquiry_fees update error:', error.code, error.message, error.details, error.hint);
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
    }

    console.log('[webhook] inquiry_fees updated rows:', count);
  }

  return NextResponse.json({ received: true });
}
