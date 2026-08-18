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
      // Nós atualizamos o cadastro dele gravando a senha e demais dados!
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

    // 5. Exibir link de ativação no console para testes do desenvolvedor
    const linkConfirmacao = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/confirm-email?token=${confirmToken}`;
    console.log('\n==================================================');
    console.log(`✉️ [SOIA EMAIL SIMULATOR]`);
    console.log(`Para: ${emailNormalizado}`);
    console.log(`Olá, ${nome}! Por favor, confirme seu e-mail clicando no link abaixo:`);
    console.log(`🔗 Link: ${linkConfirmacao}`);
    console.log('==================================================\n');

    return NextResponse.json({ success: true, userId });
  } catch (err: any) {
    console.error('Erro no registro de usuário:', err);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}
