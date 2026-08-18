import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const {
      projetoId,
      secaoId,
      titulo,
      conteudo,
      oQueProduzi,
      oQueMudou,
      ondeTenhoDuvida,
      oQuePrecisoAvancar
    } = await req.json();

    if (!secaoId || !conteudo) {
      return new NextResponse('Seção e conteúdo são obrigatórios.', { status: 400 });
    }

    const projeto = await prisma.projetoOrientacao.findUnique({
      where: { id: projetoId },
      include: { orientando: true, orientador: true }
    });

    if (!projeto) {
      return new NextResponse('Projeto de orientação não encontrado.', { status: 404 });
    }

    const secao = await prisma.secaoTexto.findUnique({
      where: { id: secaoId }
    });

    if (!secao) {
      return new NextResponse('Seção de texto não encontrada.', { status: 404 });
    }

    // Criar histórico de versão da versão anterior
    await prisma.versaoSecaoTexto.create({
      data: {
        secaoId: secao.id,
        versao: secao.versao,
        conteudo: secao.conteudo,
        autorPapel: 'ORIENTANDO',
        correcoes: secao.correcoes,
        parecerIA: secao.parecerIA
      }
    });

    const novaVersao = secao.versao + 1;

    // Gerar parecer de IA comparativo com correções passadas
    let parecerIA = secao.parecerIA || null;
    if (secao.correcoes) {
      try {
        const { analisarRevisaoTexto } = await import('@/lib/gemini');
        parecerIA = await analisarRevisaoTexto(
          secao.conteudo,
          secao.correcoes,
          conteudo
        );
      } catch (err) {
        console.error('Erro ao chamar IA para revisão comparativa:', err);
      }
    }

    // Atualizar a seção
    const secaoAtualizada = await prisma.secaoTexto.update({
      where: { id: secao.id },
      data: {
        conteudo,
        status: 'PENDENTE',
        versao: novaVersao,
        parecerIA,
        oQueProduzi,
        oQueMudou,
        ondeTenhoDuvida,
        oQuePrecisoAvancar
      }
    });

    // Criar Notificação no Portal para o Orientador
    const { criarNotificacao } = await import('@/lib/notifications');
    await criarNotificacao(
      projeto.orientadorId,
      'Novo Capítulo para Revisão',
      `O aluno ${projeto.orientando.nome} submeteu a versão v${novaVersao} do capítulo "${titulo}".`
    );

    // E-mail Notificação (SMTP Real / Simulador)
    try {
      const { enviarEmail } = await import('@/lib/email');
      const linkOrientador = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/orientador/alunos/${projeto.orientandoId}/redacao`;
      const html = `
        <div style="background-color: #0b1220; color: #ffffff; padding: 40px 20px; font-family: Inter, Helvetica, Arial, sans-serif; text-align: center; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
          <h2 style="color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; margin-bottom: 8px;">SOIA</h2>
          <p style="color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 0; margin-bottom: 24px;">Revisão de Capítulos</p>
          <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid #1e293b; padding: 24px; border-radius: 12px; margin-bottom: 24px; text-align: left;">
            <p style="font-size: 14px; color: #e2e8f0; margin-top: 0; line-height: 1.6;">Olá, <strong>Prof. ${projeto.orientador.nome}</strong>!</p>
            <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">Seu orientando <strong>${projeto.orientando.nome}</strong> submeteu a versão v${novaVersao} do capítulo <strong>"${titulo}"</strong> contendo o protocolo de submissão preenchido. Clique no botão abaixo para avaliar:</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${linkOrientador}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block;">Avaliar Capítulo</a>
            </div>
          </div>
          <p style="font-size: 11px; color: #475569; margin-top: 32px;">Este é um e-mail automático enviado pelo SOIA. Por favor, não responda.</p>
        </div>
      `;
      await enviarEmail(projeto.orientador.email, `SOIA: Novo Capítulo para Revisão - ${projeto.orientando.nome}`, html);
    } catch (e) {
      console.error('Erro ao disparar e-mail de notificação de submissão:', e);
    }

    revalidatePath('/aluno/redacao');
    revalidatePath(`/orientador/alunos/${projeto.orientandoId}/redacao`);

    return NextResponse.json({ success: true, secao: secaoAtualizada });
  } catch (err: any) {
    console.error('Erro ao submeter capítulo:', err);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}
