import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Informe seu e-mail cadastrado.' },
        { status: 400 }
      );
    }

    const emailNormalizado = email.toLowerCase().trim();

    const user = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
    });

    // Segurança: não revelar se o email existe ou não
    const respostaGenerica = {
      success: true,
      message: 'Se o e-mail estiver cadastrado, um link de redefinição será enviado.',
    };

    if (!user) {
      return NextResponse.json(respostaGenerica);
    }

    // Gerar token de redefinição
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExp = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await prisma.usuario.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExp },
    });

    const linkRedefinicao = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    console.log(`\n[SOIA] Link de redefinição para ${emailNormalizado}: ${linkRedefinicao}\n`);

    // Tentar enviar e-mail SMTP real
    const assunto = 'Redefinição de Senha — SOIA';
    const html = `
      <div style="background-color: #0b1220; color: #ffffff; padding: 40px 20px; font-family: Inter, Helvetica, Arial, sans-serif; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
        <h2 style="color: #ffffff; font-size: 24px; font-weight: 800; margin-bottom: 8px;">SOIA</h2>
        <p style="color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 0; margin-bottom: 24px;">Sistema de Orientação Inteligente Avançado</p>
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid #1e293b; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <p style="font-size: 14px; color: #e2e8f0; margin-top: 0;">Olá, <strong>${user.nome}</strong>!</p>
          <p style="font-size: 14px; color: #94a3b8;">Você solicitou a redefinição de senha. Clique no botão abaixo para criar uma nova senha:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${linkRedefinicao}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block;">Redefinir Minha Senha</a>
          </div>
          <p style="font-size: 12px; color: #64748b;">Se o botão não funcionar: <a href="${linkRedefinicao}" style="color: #3b82f6;">${linkRedefinicao}</a></p>
          <p style="font-size: 12px; color: #64748b; margin-top: 16px;">O link expira em 1 hora.</p>
        </div>
      </div>
    `;

    let emailEnviado = false;
    try {
      const { enviarEmail } = await import('@/lib/email');
      emailEnviado = await enviarEmail(emailNormalizado, assunto, html);
    } catch (err) {
      console.error('Falha ao enviar email de redefinição:', err);
    }

    if (emailEnviado) {
      return NextResponse.json({
        success: true,
        message: 'E-mail de redefinição enviado! Verifique sua caixa de entrada.',
      });
    }

    // Fallback: retornar o link pro usuário se SMTP falhou
    return NextResponse.json({
      success: true,
      message: 'Não foi possível enviar o e-mail automaticamente. Use o link abaixo para redefinir sua senha:',
      resetLink: linkRedefinicao,
      aviso: 'Este link expira em 1 hora.',
    });
  } catch (err: any) {
    console.error('Erro no forgot-password:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor. Tente novamente.' },
      { status: 500 }
    );
  }
}