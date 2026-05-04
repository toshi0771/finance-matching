import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error('[subscription-webhook] signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      case 'customer.subscription.created': {
        const sub = event.data.object as Stripe.Subscription;
        const companyId = sub.metadata.company_id;
        const clerkUserId = sub.metadata.clerk_user_id;

        if (!companyId || !clerkUserId) {
          console.error('[subscription-webhook] metadata missing on subscription', sub.id);
          break;
        }

        const { error: dbErr } = await admin.from('company_plans').insert({
          company_id: companyId,
          stripe_subscription_id: sub.id,
          plan_type: 'monthly',
          status: 'active',
        });
        if (dbErr) console.error('[subscription-webhook] company_plans insert:', dbErr);

        const clerk = await clerkClient();
        await clerk.users.updateUserMetadata(clerkUserId, {
          publicMetadata: { company_plan: 'paid' },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const clerkUserId = sub.metadata.clerk_user_id;

        const { error: dbErr } = await admin
          .from('company_plans')
          .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
          .eq('stripe_subscription_id', sub.id);
        if (dbErr) console.error('[subscription-webhook] company_plans cancelled update:', dbErr);

        if (clerkUserId) {
          const clerk = await clerkClient();
          await clerk.users.updateUserMetadata(clerkUserId, {
            publicMetadata: { company_plan: 'cancelled' },
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subRef = invoice.parent?.subscription_details?.subscription;
        const subscriptionId = subRef
          ? typeof subRef === 'string'
            ? subRef
            : (subRef as Stripe.Subscription).id
          : null;

        if (subscriptionId) {
          const { error: dbErr } = await admin
            .from('company_plans')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subscriptionId);
          if (dbErr) console.error('[subscription-webhook] company_plans past_due update:', dbErr);
        }
        break;
      }
    }
  } catch (err) {
    console.error('[subscription-webhook] handler error:', err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
