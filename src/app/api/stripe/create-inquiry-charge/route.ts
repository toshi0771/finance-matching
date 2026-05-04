import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { inquiry_id, company_id } = await request.json();

    if (!inquiry_id) {
      return NextResponse.json({ error: 'inquiry_id is required' }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 5000,
      currency: 'jpy',
      metadata: { inquiry_id, company_id },
    });

    const client = createAdminClient();
    const { error: dbError } = await client.from('inquiry_fees').insert({
      inquiry_id,
      amount: 5000,
      status: 'pending',
      stripe_invoice_id: paymentIntent.id,
    });

    if (dbError) {
      console.error('inquiry_fees insert error:', dbError.code, dbError.message, dbError.details, dbError.hint);
      return NextResponse.json({ error: 'DB insert failed' }, { status: 500 });
    }

    return NextResponse.json({ client_secret: paymentIntent.client_secret });
  } catch (err) {
    console.error('create-inquiry-charge error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
