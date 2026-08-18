import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const {
      projetoId,
      temaFrase,
      problemaPercebido,
      perguntaPesquisa,
      objetivoGeral,
      publicoContexto,
      produtoEsperado,
      acessoCampo,
      situacaoEtica,
      apoiosRestricoes,
      normasEntrega,
      programa,
      textoDiagnostico,
    } = await req.json();

    if (!projetoId || !temaFrase || !problemaPercebido || !perguntaPesquisa || !textoDiagnostico) {
      return new NextResponse('Preencha os campos obrigatórios da Ficha Inicial.', { status: 400 });
    }

    // Atualizar o projeto de orientação no banco com os 18 campos e transitar a etapa
    const projetoAtualizado = await prisma.projetoOrientacao.update({
      where: { id: projetoId },
      data: {
        temaFrase,
        problemaPercebido,
        perguntaPesquisa,
        objetivoGeral,
        publicoContexto,
        produtoEsperado,
        acessoCampo,
        situacaoEtica,
        apoiosRestricoes,
        normasEntrega,
        programa,
        textoDiagnostico,
        etapaAtual: 'E1_DELIMITACAO', // Avança da etapa E0 para E1 automaticamente!
      },
    });

    return NextResponse.json({ success: true, projeto: projetoAtualizado });
  } catch (err: any) {
    console.error('Erro ao completar onboarding:', err);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}
