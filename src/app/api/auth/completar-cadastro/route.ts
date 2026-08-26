import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const { token, senha } = await req.json();

    if (!token || !senha) {
      return NextResponse.json(
        { success: false, error: 'Token e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    if (senha.length < 6) {
      return NextResponse.json(
        { success: false, error: 'A senha deve ter pelo menos 6 caracteres.' },
        { status: 400 }
      );
    }

    // Buscar usuário pelo token de confirmação
    const user = await prisma.usuario.findFirst({
      where: { confirmToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Link inválido ou já utilizado. Solicite um novo convite ao seu orientador.' },
        { status: 400 }
      );
    }

    // Verificar expiração
    if (user.confirmTokenExp && user.confirmTokenExp < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Este link expirou. Solicite um novo convite ao seu orientador.' },
        { status: 400 }
      );
    }

    // Se o usuário já tem senha, o link já foi usado
    if (user.senha) {
      return NextResponse.json(
        { success: false, error: 'Você já criou sua senha. Faça login normalmente.' },
        { status: 400 }
      );
    }

    // Hash da senha e ativar conta
    const hashSenha = await bcrypt.hash(senha, 10);

    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        senha: hashSenha,
        emailConfirmado: true,
        confirmToken: null,
        confirmTokenExp: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Senha criada com sucesso! Agora você pode fazer login na plataforma.',
    });
  } catch (err: any) {
    console.error('Erro ao completar cadastro:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}