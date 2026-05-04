/**
 * Stripe プロダクト（月額10,000円）作成スクリプト
 *
 * 実行方法:
 *   STRIPE_SECRET_KEY=sk_test_xxx npx tsx src/scripts/create-stripe-product.ts
 *
 * または Node.js 20.6+ の場合:
 *   node --env-file=.env.local --experimental-strip-types src/scripts/create-stripe-product.ts
 *
 * 実行後、出力された STRIPE_PRICE_ID を .env.local に追加してください。
 * また Stripe ダッシュボードでサブスクリプション用 Webhook エンドポイントを作成し、
 * STRIPE_SUBSCRIPTION_WEBHOOK_SECRET を .env.local に追加してください。
 * Webhook イベント: customer.subscription.created, customer.subscription.deleted, invoice.payment_failed
 */
import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error('Error: STRIPE_SECRET_KEY が設定されていません。');
  console.error('実行例: STRIPE_SECRET_KEY=sk_test_xxx npx tsx src/scripts/create-stripe-product.ts');
  process.exit(1);
}

const stripe = new Stripe(key, { apiVersion: '2026-04-22.dahlia' });

async function main() {
  console.log('Stripe プロダクトと価格を作成中...\n');

  const product = await stripe.products.create({
    name: '金融会社サブスクプラン',
    description: '月額10,000円プラン。問い合わせ手数料なし、専用ダッシュボード・掲載情報管理機能付き。',
  });
  console.log('✓ プロダクト作成:', product.id);

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 10000,
    currency: 'jpy',
    recurring: { interval: 'month' },
  });
  console.log('✓ 価格作成:', price.id);

  console.log('\n========================================');
  console.log('.env.local に以下を追加してください:');
  console.log('========================================');
  console.log(`STRIPE_PRICE_ID=${price.id}`);
  console.log('STRIPE_SUBSCRIPTION_WEBHOOK_SECRET=whsec_xxx  # Stripe ダッシュボードで取得');
  console.log('========================================\n');
}

main().catch(err => {
  console.error('エラー:', err.message);
  process.exit(1);
});
