import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const transport = process.env.AWS_SES_SMTP_USER
  ? nodemailer.createTransport({
      host: process.env.AWS_SES_SMTP_HOST || 'email-smtp.us-east-1.amazonaws.com',
      port: parseInt(process.env.AWS_SES_SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.AWS_SES_SMTP_USER,
        pass: process.env.AWS_SES_SMTP_PASSWORD,
      },
    })
  : nodemailer.createTransport({
      host: process.env.MAILPIT_HOST || 'localhost',
      port: parseInt(process.env.MAILPIT_PORT || '1025'),
      secure: false,
    })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      )
    }

    // Simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    const toEmail = process.env.EMAIL_FROM || 'noreply@yourdomain.com'

    await transport.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Website Contact'}" <${toEmail}>`,
      to: toEmail,
      replyTo: `"${name}" <${email}>`,
      subject: subject ? `Contact Form: ${subject}` : `New contact form submission from ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #10242b; margin-bottom: 24px;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0; font-weight: 600; color: #374151; width: 120px;">Name</td>
              <td style="padding: 12px 0; color: #212529;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0; font-weight: 600; color: #374151;">Email</td>
              <td style="padding: 12px 0;"><a href="mailto:${email}" style="color: #034F98;">${email}</a></td>
            </tr>
            ${phone ? `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0; font-weight: 600; color: #374151;">Phone</td>
              <td style="padding: 12px 0; color: #212529;">${phone}</td>
            </tr>` : ''}
            ${subject ? `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0; font-weight: 600; color: #374151;">Subject</td>
              <td style="padding: 12px 0; color: #212529;">${subject}</td>
            </tr>` : ''}
          </table>
          <div style="margin-top: 24px;">
            <p style="font-weight: 600; color: #374151; margin-bottom: 8px;">Message:</p>
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; color: #212529; line-height: 1.6;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}
