import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const { textoDiagnostico } = await req.json();
    if (!textoDiagnostico) {
      return new NextResponse('Texto diagnóstico é obrigatório.', { status: 400 });
    }

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash:free';

    const prompt = `Você é uma IA integrada ao SOIA (Sistema de Orientação Inteligente Avançado).
Sua tarefa é analisar o rascunho de texto de diagnóstico inicial de um estudante acadêmico e extrair dele os principais campos estruturados de pesquisa.

Retorne EXCLUSIVAMENTE um objeto JSON válido contendo as chaves:
- "temaFrase": O tema resumido em apenas uma frase direta.
- "problemaPercebido": Descrição concisa do problema prático ou acadêmico.
- "perguntaPesquisa": Pergunta diretiva e clara de investigação.
- "objetivoGeral": Objetivo geral claro (iniciando com verbo de ação).
- "publicoContexto": Público-alvo, materiais, localidade ou contexto do estudo.
- "produtoEsperado": Artefato final, texto ou conclusão esperada.

Atenção: Não adicione blocos de código markdown (como \`\`\`json), nem introduções ou explicações. Retorne puramente a string JSON.

Rascunho de Diagnóstico Inicial:
"${textoDiagnostico}"`;

    let extraidos = {
      temaFrase: '',
      problemaPercebido: '',
      perguntaPesquisa: '',
      objetivoGeral: '',
      publicoContexto: '',
      produtoEsperado: '',
    };

    if (openRouterKey) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openRouterKey}`,
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'SOIA - Academics System',
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices[0]?.message?.content || '';
          
          // Limpar blocos de código se a IA violar o formato puro
          const cleanJson = content
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();

          const parsed = JSON.parse(cleanJson);
          extraidos = { ...extraidos, ...parsed };
        }
      } catch (err) {
        console.error('Erro ao chamar OpenRouter para extração de ficha:', err);
      }
    }

    return NextResponse.json(extraidos);
  } catch (err: any) {
    console.error('Erro na extração assistida por IA:', err);
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}
