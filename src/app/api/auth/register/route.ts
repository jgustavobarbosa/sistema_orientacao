import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { nome, email, whatsapp, senha } = await req.json();

    if (!nome || !email || !senha) {
      return new NextResponse('Preencha os campos obrigatórios.', { status: 400 });
    }

    const emailNormalizado = email.toLowerCase().trim();

    // 1. Verificar se usuário já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
    });

    let confirmToken = crypto.randomBytes(32).toString('hex');
    let confirmTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
    let userId = '';

    const hashSenha = await bcrypt.hash(senha, 10);

    if (usuarioExistente) {
      // Se ele já possui senha cadastrada, então o e-mail já está em uso ativo
      if (usuarioExistente.senha) {
        return new NextResponse('Este e-mail já está cadastrado.', { status: 400 });
      }

      // Se ele NÃO possui senha, significa que foi cadastrado previamente pelo professor
      const userAtualizado = await prisma.usuario.update({
        where: { id: usuarioExistente.id },
        data: {
          nome,
          whatsapp: whatsapp || usuarioExistente.whatsapp,
          senha: hashSenha,
          confirmToken,
          confirmTokenExp,
        },
      });
      userId = userAtualizado.id;
    } else {
      // Criação normal para auto-cadastro completo do zero
      const novoUsuario = await prisma.usuario.create({
        data: {
          nome,
          email: emailNormalizado,
          whatsapp: whatsapp || null,
          senha: hashSenha,
          ativo: false,
          emailConfirmado: false,
          confirmToken,
          confirmTokenExp,
        },
      });
      userId = novoUsuario.id;
    }

    // 5. Exibir link de ativação no console para testes locais
    const linkConfirmacao = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/confirm-email?token=${confirmToken}`;
    console.log('\n==================================================');
    console.log(`✉️ [SOIA EMAIL SIMULATOR]`);
    console.log(`Para: ${emailNormalizado}`);
    console.log(`🔗 Link: ${linkConfirmacao}`);
    console.log('==================================================\n');

    // 6. Enviar e-mail real via SMTP (Gmail)
    const assunto = 'Confirme seu e-mail — SOIA';
    const html = `
      <div style="background-color: #0b1220; color: #ffffff; padding: 40px 20px; font-family: Inter, Helvetica, Arial, sans-serif; text-align: center; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
        <h2 style="color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; margin-bottom: 8px;">SOIA</h2>
        <p style="color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 0; margin-bottom: 24px;">Sistema de Orientação Inteligente Avançado</p>
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid #1e293b; padding: 24px; border-radius: 12px; margin-bottom: 24px; text-align: left;">
          <p style="font-size: 14px; color: #e2e8f0; margin-top: 0; line-height: 1.6;">Olá, <strong>${nome}</strong>!</p>
          <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">Obrigado por se cadastrar no SOIA. Para confirmar seu e-mail e ativar sua conta, por favor clique no botão abaixo:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${linkConfirmacao}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">Confirmar Meu E-mail</a>
          </div>
          <p style="font-size: 12px; color: #64748b; line-height: 1.6; margin-bottom: 0;">Se o botão não funcionar, copie e cole o link a seguir no seu navegador: <br/><a href="${linkConfirmacao}" style="color: #3b82f6; text-decoration: underline;">${linkConfirmacao}</a></p>
        </div>
        <p style="font-size: 11px; color: #475569; margin-top: 32px;">Este é um e-mail automático enviado pelo SOIA. Por favor, não responda.</p>
      </div>
    `;

    const { enviarEmail } = await import('@/lib/email');
    await enviarEmail(emailNormalizado, assunto, html);

    return NextResponse.json({ success: true, userId });
  } catch (err: any) {
    console.error('Erro no registro de usuário:', err);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}
