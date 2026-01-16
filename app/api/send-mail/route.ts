import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { authOptions } from '@/lib/auth-config';

export async function POST(request: Request) {
  try {
    // 0. Get the email from the session
    const { dimension, html } = await request.json();

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return new NextResponse('Unauthorized: No user session found', { status: 401 });
    }

    const userEmail = session.user.email;

    // 1. Create the Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 2. Setup Email Options
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: userEmail,
      subject: `CloudX Assessment Feedback for ${dimension}`,
      html: html,
    };

    // 3. Send the Email
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Nodemailer Error:', error);
    return NextResponse.json({ message: 'Failed to send email' }, { status: 500 });
  }
}
