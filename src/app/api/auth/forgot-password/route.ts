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

    // Por motivos de segurança, se o usuário não existir, não expomos ao cliente que o email não existe.
    // Apenas retornamos sucesso genérico, mas de fato não geramos token.
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

    // 4. Imprimir no terminal para testes do orientador/desenvolvedor
    const linkRedefinicao = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    console.log('\n==================================================');
    console.log(`✉️ [SOIA EMAIL SIMULATOR]`);
    console.log(`Para: ${emailNormalizado}`);
    console.log(`Olá, ${user.nome}! Você solicitou a redefinição de sua senha.`);
    console.log(`🔗 Link: ${linkRedefinicao}`);
    console.log('==================================================\n');

    return NextResponse.json({ success: true, message: 'Se o e-mail estiver cadastrado, um link de redefinição será enviado.' });
  } catch (err: any) {
    console.error('Erro na solicitação de redefinição de senha:', err);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}
