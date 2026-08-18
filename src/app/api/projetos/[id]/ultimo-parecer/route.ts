import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PapelUsuario } from '@prisma/client';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id: projetoId } = await params;

  if (!session || session.user.papel !== PapelUsuario.ORIENTADOR) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    // Buscar o último documento desse projeto que possui um parecer LLM associado
    const documento = await prisma.documento.findFirst({
      where: { 
        projetoId,
        parecerLLM: { isNot: null }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        parecerLLM: true
      }
    });

    if (!documento || !documento.parecerLLM) {
      return NextResponse.json({ 
        sucesso: false, 
        mensagem: 'Nenhum documento com parecer LLM encontrado para este projeto.' 
      });
    }

    return NextResponse.json({
      sucesso: true,
      tituloDocumento: documento.titulo,
      categoria: documento.categoria,
      versao: documento.versao,
      resumo: documento.parecerLLM.resumo,
      pontosFortes: documento.parecerLLM.pontosFortes,
      lacunas: documento.parecerLLM.lacunas,
      orientacoes: documento.parecerLLM.orientacoesProximasEtapas,
      geradoEm: documento.parecerLLM.geradoEm
    });
  } catch (error: any) {
    console.error('Erro ao buscar último parecer do projeto:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
