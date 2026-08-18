import nodemailer from 'nodemailer';

// Inicializar o transportador SMTP do Gmail usando as variáveis de ambiente
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true para 465, false para outras portas
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Senha de aplicativo do Gmail
  },
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Função utilitária para envio de e-mails em HTML de forma robusta.
 */
export async function enviarEmail(para: string, assunto: string, html: string): Promise<boolean> {
  const de = process.env.EMAIL_USER || 'contato@soia.edu.br';

  try {
    const info = await transporter.sendMail({
      from: `"SOIA — Sistema de Orientação Inteligente" <${de}>`,
      to: para,
      subject: assunto,
      html: html,
    });

    console.log(`✉️ [SOIA EMAIL SENT] ID: ${info.messageId} | Para: ${para} | Assunto: ${assunto}`);
    return true;
  } catch (error) {
    console.error(`❌ [SOIA EMAIL ERROR] Erro ao enviar e-mail para ${para}:`, error);
    return false;
  }
}
