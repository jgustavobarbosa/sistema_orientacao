import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return new NextResponse('Token de ativação ausente.', { status: 400 });
    }

    // 1. Procurar o usuário pelo token de confirmação
    const user = await prisma.usuario.findFirst({
      where: { 
        confirmToken: token,
      },
    });

    if (!user) {
      return new NextResponse('Token de confirmação inválido.', { status: 400 });
    }

    // 2. Verificar se o token não expirou
    if (user.confirmTokenExp && user.confirmTokenExp < new Date()) {
      return new NextResponse('Este link de confirmação expirou. Faça um novo cadastro ou solicite reenvio.', { status: 400 });
    }

    // 3. Ativar emailConfirmado, limpar tokens
    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        emailConfirmado: true,
        confirmToken: null,
        confirmTokenExp: null,
      },
    });

    return NextResponse.json({ success: true, message: 'E-mail confirmado com sucesso!' });
  } catch (err: any) {
    console.error('Erro na confirmação de e-mail:', err);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}
