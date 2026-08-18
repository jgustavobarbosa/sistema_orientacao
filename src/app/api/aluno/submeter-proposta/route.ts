import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PapelUsuario, StatusProjeto } from '@prisma/client';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.papel !== PapelUsuario.ORIENTANDO) {
    return new NextResponse('Não autorizado', { status: 401 });
  }

  try {
    const { titulo, descricao, nivel, orientadorId } = await req.json();

    if (!titulo || !orientadorId) {
      return new NextResponse('Campos obrigatórios ausentes', { status: 400 });
    }

    // Criar o projeto como proposta pendente de validação pelo orientador
    const projeto = await prisma.projetoOrientacao.create({
      data: {
        orientadorId,
        orientandoId: session.user.id,
        titulo,
        perguntaPesquisa: descricao || '',
        nivel: nivel as any,
        status: StatusProjeto.PROPOSTA,
      },
    });

    return NextResponse.json({ projeto });
  } catch (err: any) {
    console.error(err);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}
