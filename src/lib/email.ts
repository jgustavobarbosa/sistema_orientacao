import nodemailer from 'nodemailer';

// Transportador SMTP como fallback
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Envia e-mail usando Resend (primário) ou SMTP (fallback).
 * Resend tem melhor deliverability em produção.
 */
export async function enviarEmail(para: string, assunto: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL || 'onboarding@resend.dev';

  // Tenta Resend primeiro
  if (apiKey && apiKey.length > 10) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `"SOIA — Sistema de Orientação Inteligente" <${from}>`,
          to: [para],
          subject: assunto,
          html: html,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`✉️ [SOIA RESEND SENT] ID: ${data.id} | Para: ${para} | Assunto: ${assunto}`);
        return true;
      }

      const errText = await res.text();
      console.error(`❌ [SOIA RESEND ERROR] ${res.status}: ${errText}`);
      // Falls through to SMTP fallback
    } catch (err) {
      console.error('❌ [SOIA RESEND ERROR] Exception:', err);
      // Falls through to SMTP fallback
    }
  }

  // Fallback: SMTP (Gmail App Password)
  const de = process.env.EMAIL_USER || 'contato@soia.edu.br';
  try {
    const info = await transporter.sendMail({
      from: `"SOIA — Sistema de Orientação Inteligente" <${de}>`,
      to: para,
      subject: assunto,
      html: html,
    });

    console.log(`✉️ [SOIA SMTP SENT] ID: ${info.messageId} | Para: ${para} | Assunto: ${assunto}`);
    return true;
  } catch (error) {
    console.error(`❌ [SOIA SMTP ERROR] Erro ao enviar e-mail para ${para}:`, error);
    return false;
  }
}