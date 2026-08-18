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

    // 1. Atualizar o projeto de orientação no banco com os 18 campos e transitar a etapa
    const projeto = await prisma.projetoOrientacao.update({
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

    // 2. Serviço de Instanciação do Modelo e Snapshoting
    // Buscar o modelo do catálogo com base no tipo de produto do projeto
    const modelo = await prisma.modeloCatalogo.findUnique({
      where: { codigo: projeto.tipoProduto },
      include: {
        etapas: {
          include: { secoes: true },
          orderBy: { ordem: 'asc' }
        }
      }
    });

    if (modelo) {
      // Remover seções antigas (se existirem) para evitar duplicados
      await prisma.secaoTexto.deleteMany({
        where: { projetoId: projeto.id }
      });
      await prisma.etapaProjeto.deleteMany({
        where: { projetoId: projeto.id }
      });

      // Instanciar cada etapa e suas seções
      for (const e of modelo.etapas) {
        // A primeira etapa (ordem === 1) começa LIBERADA, as demais começam BLOQUEADAS
        const statusGate = e.ordem === 1 ? 'LIBERADO' : 'BLOQUEADO';

        const etapaProj = await prisma.etapaProjeto.create({
          data: {
            projetoId: projeto.id,
            etapa: e.etapa,
            ordem: e.ordem,
            titulo: e.titulo,
            statusGate,
          }
        });

        for (const s of e.secoes) {
          await prisma.secaoTexto.create({
            data: {
              projetoId: projeto.id,
              etapaProjetoId: etapaProj.id,
              titulo: s.titulo,
              ordem: s.ordem,
              obrigatoria: s.obrigatoria,
              instrucaoPrompt: s.instrucaoPrompt,
              criteriosAceite: s.criteriosAceite,
              conteudo: '',
              status: 'PENDENTE'
            }
          });
        }
      }
      console.log(`[SOIA SNAPSHOT] Modelo ${projeto.tipoProduto} instanciado com sucesso no projeto ${projeto.id}`);
    }

    return NextResponse.json({ success: true, projeto });
  } catch (err: any) {
    console.error('Erro ao completar onboarding e instanciar modelo:', err);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}
