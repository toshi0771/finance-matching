import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const body = await req.json();
    const { name, email, message, company, type } = body;

    const subject = type === 'company'
      ? `【業者様からのお問い合わせ】${company || ''} ${name}`
      : `【ユーザーからのお問い合わせ】${name}`;

    await resend.emails.send({
      from: 'FinanceMatch <onboarding@resend.dev>',
      to: process.env.ADMIN_EMAIL!,
      subject,
      html: `
        <h2>${subject}</h2>
        <p><strong>お名前:</strong> ${name}</p>
        ${company ? `<p><strong>会社名:</strong> ${company}</p>` : ''}
        <p><strong>メール:</strong> ${email}</p>
        <p><strong>内容:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}