import { NextResponse } from 'next/server';
import { extrairDadosProjetoDoPlano } from '@/lib/gemini';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const arquivo = formData.get('arquivo') as File;

    if (!arquivo) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Leitura simulada de texto do arquivo de plano de orientação
    let textoPlano = `Plano de Orientação Acadêmica de Trabalho de Conclusão / Pesquisa.\n`;
    textoPlano += `Arquivo: ${arquivo.name}\n`;
    textoPlano += `Proposta de Pesquisa Inicial.`;

    const dadosExtraidos = await extrairDadosProjetoDoPlano(arquivo.name, textoPlano);

    return NextResponse.json({
      sucesso: true,
      ...dadosExtraidos
    });
  } catch (error: any) {
    console.error('Erro na extração de plano com IA:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
