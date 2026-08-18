import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PapelUsuario, StatusProjeto } from '@prisma/client';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.papel !== PapelUsuario.ORIENTANDO) {
    return new NextResponse('Não autorizado', { status: 401 });
  }

  try {
    // Buscar o projeto ativo do aluno
    const projeto = await prisma.projetoOrientacao.findFirst({
      where: { orientandoId: session.user.id },
      include: {
        orientador: true,
        marcos: {
          orderBy: { dataPrevista: 'asc' },
        },
        reunioes: {
          orderBy: { numeroEncontro: 'desc' },
          take: 5,
        },
        secoesTexto: {
          orderBy: { updatedAt: 'desc' },
          include: {
            auditoriasIA: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      },
    });

    if (!projeto) {
      // Buscar todos os orientadores disponíveis para o select de proposta
      const orientadores = await prisma.usuario.findMany({
        where: { papel: PapelUsuario.ORIENTADOR },
        select: { id: true, nome: true, email: true }
      });

      return NextResponse.json({ orientadores });
    }

    // Buscar todas as tarefas de reuniões atribuídas a este aluno
    const reunioesIds = await prisma.reuniao.findMany({
      where: { projetoId: projeto.id },
      select: { id: true },
    });

    const tarefas = await prisma.tarefaReuniao.findMany({
      where: {
        reuniaoId: { in: reunioesIds.map((r) => r.id) },
        responsavelId: session.user.id,
      },
      orderBy: { prazo: 'asc' },
    });

    return NextResponse.json({ projeto, tarefas });
  } catch (err: any) {
    console.error(err);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}
