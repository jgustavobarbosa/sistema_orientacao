import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { nome, email, whatsapp, senha } = await req.json();

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { success: false, error: 'Preencha os campos obrigatórios: nome, e-mail e senha.' },
        { status: 400 }
      );
    }

    if (senha.length < 6) {
      return NextResponse.json(
        { success: false, error: 'A senha deve ter pelo menos 6 caracteres.' },
        { status: 400 }
      );
    }

    const emailNormalizado = email.toLowerCase().trim();
    const orientadorEmail = process.env.ORIENTADOR_EMAIL?.toLowerCase();
    const ehOrientador = orientadorEmail === emailNormalizado;

    // 1. Verificar se usuário já existe com senha cadastrada
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
    });

    if (usuarioExistente?.senha) {
      return NextResponse.json(
        { success: false, error: 'Este e-mail já está cadastrado. Faça login ou use "Esqueci minha senha".' },
        { status: 400 }
      );
    }

    const hashSenha = await bcrypt.hash(senha, 10);
    const confirmToken = crypto.randomBytes(32).toString('hex');
    const confirmTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (usuarioExistente && !usuarioExistente.senha) {
      // Aluno pré-cadastrado pelo professor — atualizar
      await prisma.usuario.update({
        where: { id: usuarioExistente.id },
        data: {
          nome,
          whatsapp: whatsapp || usuarioExistente.whatsapp,
          senha: hashSenha,
          confirmToken: ehOrientador ? null : confirmToken,
          confirmTokenExp: ehOrientador ? null : confirmTokenExp,
          ativo: ehOrientador ? true : usuarioExistente.ativo,
          emailConfirmado: ehOrientador ? true : usuarioExistente.emailConfirmado,
          papel: ehOrientador ? 'ORIENTADOR' : usuarioExistente.papel,
        },
      });
    } else {
      // Cadastro novo
      await prisma.usuario.create({
        data: {
          nome,
          email: emailNormalizado,
          whatsapp: whatsapp || null,
          senha: hashSenha,
          ativo: ehOrientador,
          emailConfirmado: ehOrientador,
          confirmToken: ehOrientador ? null : confirmToken,
          confirmTokenExp: ehOrientador ? null : confirmTokenExp,
          papel: ehOrientador ? 'ORIENTADOR' : 'ORIENTANDO',
        },
      });
    }

    // 2. Se for orientador, não precisa de confirmação
    if (ehOrientador) {
      return NextResponse.json({
        success: true,
        message: 'Cadastro realizado com sucesso! Você já pode fazer login.',
      });
    }

    // 3. Tentar enviar e-mail de confirmação
    const linkConfirmacao = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/confirm-email?token=${confirmToken}`;
    const assunto = 'Confirme seu e-mail — SOIA';
    const html = `
      <div style="background-color: #0b1220; color: #ffffff; padding: 40px 20px; font-family: Inter, Helvetica, Arial, sans-serif; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
        <h2 style="color: #ffffff; font-size: 24px; font-weight: 800; margin-bottom: 8px;">SOIA</h2>
        <p style="color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 0; margin-bottom: 24px;">Sistema de Orientação Inteligente Avançado</p>
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid #1e293b; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
          <p style="font-size: 14px; color: #e2e8f0; margin-top: 0;">Olá, <strong>${nome}</strong>!</p>
          <p style="font-size: 14px; color: #94a3b8;">Obrigado por se cadastrar no SOIA. Para confirmar seu e-mail, clique no botão abaixo:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${linkConfirmacao}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block;">Confirmar Meu E-mail</a>
          </div>
          <p style="font-size: 12px; color: #64748b;">Link: <a href="${linkConfirmacao}" style="color: #3b82f6;">${linkConfirmacao}</a></p>
        </div>
      </div>
    `;

    let emailEnviado = false;
    try {
      const { enviarEmail } = await import('@/lib/email');
      emailEnviado = await enviarEmail(emailNormalizado, assunto, html);
    } catch (err) {
      console.error('Falha ao enviar email de confirmação:', err);
    }

    if (emailEnviado) {
      return NextResponse.json({
        success: true,
        message: 'Cadastro realizado! Verifique seu e-mail para confirmar a conta.',
      });
    }

    // Fallback: retornar o token pro usuário usar manualmente
    return NextResponse.json({
      success: true,
      message: 'Cadastro realizado! Use o link abaixo para confirmar seu e-mail (o disparo automático falhou):',
      confirmLink: linkConfirmacao,
      precisaConfirmarEmail: true,
    });
  } catch (err: any) {
    console.error('Erro no registro:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}