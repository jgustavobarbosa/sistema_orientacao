import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new NextResponse('E-mail obrigatório.', { status: 400 });
    }

    const emailNormalizado = email.toLowerCase().trim();

    // 1. Verificar se usuário existe
    const user = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
    });

    if (!user) {
      return NextResponse.json({ success: true, message: 'Se o e-mail estiver cadastrado, um link de redefinição será enviado.' });
    }

    // 2. Gerar token de redefinição
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExp = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // 3. Atualizar no banco
    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExp,
      },
    });

    // 4. Imprimir no terminal para testes locais
    const linkRedefinicao = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    console.log('\n==================================================');
    console.log(`✉️ [SOIA EMAIL SIMULATOR]`);
    console.log(`Para: ${emailNormalizado}`);
    console.log(`🔗 Link: ${linkRedefinicao}`);
    console.log('==================================================\n');

    // 5. Enviar e-mail real via SMTP (Gmail)
    const assunto = 'Redefinição de Senha — SOIA';
    const html = `
      <div style="background-color: #0b1220; color: #ffffff; padding: 40px 20px; font-family: Inter, Helvetica, Arial, sans-serif; text-align: center; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
        <h2 style="color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; margin-bottom: 8px;">SOIA</h2>
        <p style="color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 0; margin-bottom: 24px;">Sistema de Orientação Inteligente Avançado</p>
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid #1e293b; padding: 24px; border-radius: 12px; margin-bottom: 24px; text-align: left;">
          <p style="font-size: 14px; color: #e2e8f0; margin-top: 0; line-height: 1.6;">Olá, <strong>${user.nome}</strong>!</p>
          <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">Você solicitou a redefinição de sua senha de acesso ao SOIA. Para escolher uma nova senha, por favor clique no botão abaixo:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${linkRedefinicao}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">Redefinir Minha Senha</a>
          </div>
          <p style="font-size: 12px; color: #64748b; line-height: 1.6; margin-bottom: 0;">Se o botão não funcionar, copie e cole o link a seguir no seu navegador: <br/><a href="${linkRedefinicao}" style="color: #3b82f6; text-decoration: underline;">${linkRedefinicao}</a></p>
          <p style="font-size: 12px; color: #64748b; line-height: 1.6; margin-top: 16px;">O link de redefinição expirará em 1 hora. Se você não solicitou essa alteração, ignore este e-mail.</p>
        </div>
        <p style="font-size: 11px; color: #475569; margin-top: 32px;">Este é um e-mail automático enviado pelo SOIA. Por favor, não responda.</p>
      </div>
    `;

    const { enviarEmail } = await import('@/lib/email');
    await enviarEmail(emailNormalizado, assunto, html);

    return NextResponse.json({ success: true, message: 'Se o e-mail estiver cadastrado, um link de redefinição será enviado.' });
  } catch (err: any) {
    console.error('Erro na solicitação de redefinição de senha:', err);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}
