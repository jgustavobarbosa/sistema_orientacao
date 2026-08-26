import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PapelUsuario } from '@prisma/client';

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.papel !== PapelUsuario.ORIENTANDO) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { campo, valor } = await req.json();

    const camposPermitidos = [
      'titulo',
      'perguntaPesquisa',
      'temaFrase',
      'problemaPercebido',
      'objetivoGeral',
      'publicoContexto',
      'produtoEsperado',
      'acessoCampo',
      'apoiosRestricoes',
      'normasEntrega',
    ];

    if (!campo || !camposPermitidos.includes(campo)) {
      return NextResponse.json({ error: 'Campo inválido ou não permitido.' }, { status: 400 });
    }

    if (!valor || valor.trim().length < 3) {
      return NextResponse.json({ error: 'O valor deve ter pelo menos 3 caracteres.' }, { status: 400 });
    }

    const projeto = await prisma.projetoOrientacao.findFirst({
      where: { orientandoId: session.user.id },
    });

    if (!projeto) {
      return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
    }

    await prisma.projetoOrientacao.update({
      where: { id: projeto.id },
      data: { [campo]: valor.trim() },
    });

    return NextResponse.json({ success: true, message: 'Projeto atualizado com sucesso!' });
  } catch (err: any) {
    console.error('Erro ao atualizar projeto:', err);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}