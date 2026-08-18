import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const { token, novaSenha } = await req.json();

    if (!token || !novaSenha) {
      return new NextResponse('Token e nova senha obrigatórios.', { status: 400 });
    }

    if (novaSenha.length < 6) {
      return new NextResponse('A senha deve ter pelo menos 6 caracteres.', { status: 400 });
    }

    // 1. Localizar usuário com o token
    const user = await prisma.usuario.findFirst({
      where: { 
        resetToken: token,
      },
    });

    if (!user) {
      return new NextResponse('Token de redefinição inválido.', { status: 400 });
    }

    // 2. Verificar se o token expirou
    if (user.resetTokenExp && user.resetTokenExp < new Date()) {
      return new NextResponse('O link de redefinição de senha expirou.', { status: 400 });
    }

    // 3. Hash da nova senha
    const hashSenha = await bcrypt.hash(novaSenha, 10);

    // 4. Salvar senha e limpar tokens
    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        senha: hashSenha,
        resetToken: null,
        resetTokenExp: null,
      },
    });

    return NextResponse.json({ success: true, message: 'Senha atualizada com sucesso!' });
  } catch (err: any) {
    console.error('Erro na redefinição de senha:', err);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}
