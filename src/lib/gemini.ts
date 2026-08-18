const apiKey = process.env.GEMINI_API_KEY;
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Configuração do OpenRouter (LLM Real)
const openRouterApiKey = process.env.OPENROUTER_API_KEY;
const openRouterModel = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash:free';

// Função auxiliar para chamar a API do OpenRouter
async function chamarOpenRouter(prompt: string): Promise<string> {
  if (!openRouterApiKey) {
    throw new Error('Chave do OpenRouter não configurada.');
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openRouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'SOAI Academic'
    },
    body: JSON.stringify({
      model: openRouterModel,
      messages: [
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro na API do OpenRouter: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

interface ParecerEstruturado {
  resumo: string;
  pontosFortes: string;
  lacunas: string;
  orientacoesProximasEtapas: string;
}

export async function gerarParecerLLM(
  tituloDocumento: string,
  categoria: string,
  conteudoTexto: string
): Promise<ParecerEstruturado> {
  
  const prompt = `
Você é um consultor acadêmico sênior, especialista em planos de atuação, propostas de TCC e roteiros de orientação de pós-graduação.
Analise o documento acadêmico a seguir, intitulado "${tituloDocumento}" (categoria: ${categoria}).

Sua função não é apenas extrair informações: você faz a primeira triagem diagnóstica do documento. Isso significa que, antes de qualquer resumo ou tabela, você deve identificar pontos fortes, lacunas, inconsistências, excessos de escopo e oportunidades de aprofundamento — e entregar recomendações concretas de o que manter, o que cortar, o que reescrever e o que acrescentar.

O texto final deve parecer escrito por um orientador experiente: direto, pragmático, sem floreios e sem linguagem de IA.

INSTRUÇÕES DE ESCRITA (HUMANIZAÇÃO OBRIGATÓRIA):
1. Ritmo: alterne frases curtas com frases um pouco mais longas. Evite listas monótonas.
2. Vocabulário proibido: “No vasto cenário”, “Ademais”, “Por conseguinte”, “É crucial destacar”, “Compreender a jornada”, “Dividir de águas”, “Um ecossistema de”, “Em suma”, “Vale ressaltar”, “Nesse sentido”, “É importante destacar”.
   Use em vez disso: “Na prática”, “Além disso”, “O foco aqui é”, “Ficou definido que”, “Mas”, “Portanto”, “O ponto fraco é”, “Sugiro”.
3. Tom: profissional, de alinhamento rápido (e-mail ou mensagem para o aluno ou para a coordenação).

REGRAS DE ANÁLISE:
- Baseie-se apenas no que está escrito no documento. Nunca invente prazos, regras, nomes de instituições ou produtos.
- Se a informação pedida não existir no texto, diga claramente: “O documento não menciona essa informação”.
- Sempre que encontrar excesso de escopo, promessas de implantação real, uso de dados identificados, dependência de parcerias ainda não formalizadas ou falta de critérios de qualidade, aponte explicitamente.
- PROIBIÇÃO ABSOLUTA DE MARKDOWN E FORMATOS DE IA: Não utilize qualquer tipo de marcação de texto como asteriscos (* ou **), barras (//), hashtags (#) ou símbolos especiais para formatação em nenhum dos campos de texto da resposta. Retorne o texto de forma puramente humanizada, corrida, limpa e profissional, como um texto corrido legível.

Retorne a resposta EXCLUSIVAMENTE em formato JSON estruturado com o seguinte schema:
{
  "resumo": "Diagnóstico rápido (5-8 linhas) sobre o que o plano já resolve bem, onde o escopo está grande ou confuso, riscos metodológicos/éticos/viabilidade e nível de maturidade geral (alto/médio/baixo) com justificativa.",
  "pontosFortes": "Sugestões de ajuste (prioridade alta para média), numeradas de 1 a N (entre 4 e 7 itens). Cada item deve conter o que está problemático/incompleto, o que fazer (cortar, reescrever, acrescentar, formalizar) e por que isso melhora o trabalho. Foque em recorte, produto, dados, ética, método e entregas.",
  "lacunas": "Análise da demanda específica: uma triagem diagnóstica detalhada do plano de orientação, consolidando as decisões de recorte do produto e o tratamento de dados sugerido, no tom profissional e direto.",
  "orientacoesProximasEtapas": "Próximos passos sugeridos para o aluno (3 a 5 itens prioritários para antes do próximo encontro ou próxima etapa de orientação)."
}

Texto do Documento:
"""
${conteudoTexto.substring(0, 15000)} // Limite de segurança para o contexto do prompt
"""
`;

  // 1. Tentar OpenRouter se a chave estiver configurada
  if (openRouterApiKey) {
    try {
      console.log(`\n[OPENROUTER] Analisando documento "${tituloDocumento}" via LLM (${openRouterModel})...`);
      const responseText = await chamarOpenRouter(prompt);
      const parsed: ParecerEstruturado = JSON.parse(responseText);
      return {
        resumo: parsed.resumo || 'Resumo não gerado.',
        pontosFortes: parsed.pontosFortes || 'Sem pontos fortes especificados.',
        lacunas: parsed.lacunas || 'Sem lacunas identificadas.',
        orientacoesProximasEtapas: parsed.orientacoesProximasEtapas || 'Sem orientações especificadas.'
      };
    } catch (error) {
      console.error('Erro ao gerar parecer via OpenRouter:', error);
      // Fallback para o gerador clássico ou mock
    }
  }

  if (!genAI) {
    // Fallback de desenvolvimento (Mock realista baseado na categoria do material)
    console.log(`\n[GEMINI LLM MOCK] Analisando documento "${tituloDocumento}" (${categoria})...`);
    
    return {
      resumo: `O presente trabalho apresenta uma análise preliminar com foco em ${tituloDocumento}. O texto está estruturado de forma consistente com a categoria de ${categoria}, abordando a fundamentação teórica e hipóteses de trabalho básicas para o andamento da pesquisa acadêmica.`,
      pontosFortes: `- **Clareza na formulação:** A pergunta de pesquisa e os objetivos gerais estão bem delineados.\n- **Estruturação geral:** A divisão dos tópicos sugerida segue as normas vigentes do programa.\n- **Revisão inicial:** Identificada fundamentação bibliográfica inicial relevante para as hipóteses.`,
      lacunas: `- **Metodologia abstrata:** Falta detalhamento do método de coleta e das métricas de avaliação dos testes.\n- **Cronograma apertado:** O volume de atividades planejadas para a próxima etapa pode comprometer a entrega se não for reduzido.\n- **Dados de validação:** Ausência de menção clara sobre quais conjuntos de dados serão utilizados nos experimentos.`,
      orientacoesProximasEtapas: `- **Detalhamento do método:** Descrever detalhadamente a arquitetura proposta e as hipóteses estatísticas na próxima entrega.\n- **Organização de dados:** Listar e documentar os datasets que serão importados no repositório de scripts.\n- **Revisão de prazos:** Ajustar o cronograma junto ao orientador para focar em metas semanais menores.`
    };
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const parsed: ParecerEstruturado = JSON.parse(responseText);
    return {
      resumo: parsed.resumo || 'Resumo não gerado.',
      pontosFortes: parsed.pontosFortes || 'Sem pontos fortes especificados.',
      lacunas: parsed.lacunas || 'Sem lacunas identificadas.',
      orientacoesProximasEtapas: parsed.orientacoesProximasEtapas || 'Sem orientações especificadas.'
    };
  } catch (error) {
    console.error('Erro ao gerar parecer no Gemini API:', error);
    return {
      resumo: `[Erro de API] Falha de comunicação com o servidor de inteligência artificial. O documento "${tituloDocumento}" foi registrado, mas o parecer não pôde ser gerado de forma automática.`,
      pontosFortes: `- Falha no carregamento. Contate o suporte técnico.`,
      lacunas: `- Falha no carregamento. Contate o suporte técnico.`,
      orientacoesProximasEtapas: `- Tente reprocessar a análise do documento a partir do painel do orientador.`
    };
  }
}

interface DadosProjetoExtraidos {
  titulo: string;
  perguntaPesquisa: string;
  nivel: string;
  programa: string;
}

export async function extrairDadosProjetoDoPlano(
  nomeArquivo: string,
  conteudoTexto: string
): Promise<DadosProjetoExtraidos> {
  const prompt = `
Você é um assistente acadêmico de inteligência artificial do SOAI.
Analise o manuscrito ou Plano de Orientação/Trabalho de Pesquisa a seguir, extraído do arquivo "${nomeArquivo}".

Sua tarefa é extrair e sugerir os metadados do projeto acadêmico de forma estruturada:
1. Título do Projeto (conciso, de até 150 caracteres)
2. Pergunta de Pesquisa Vigente (a questão central que o trabalho tenta responder, com clareza científica, em formato de pergunta)
3. Nível do Projeto (deve ser estritamente um destes enums: "IC", "TCC", "MESTRADO", "DOUTORADO" ou "POS_DOC")
4. Programa Acadêmico (nome do curso ou pós-graduação, ex: "Ciência da Computação", "Engenharia de Software", "Educação")

Retorne a resposta EXCLUSIVAMENTE em formato JSON estruturado com o seguinte schema:
{
  "titulo": "Título do projeto extraído do texto",
  "perguntaPesquisa": "Pergunta de pesquisa estruturada extraída do texto",
  "nivel": "Enum do nível extraído (IC | TCC | MESTRADO | DOUTORADO | POS_DOC)",
  "programa": "Nome do programa acadêmico extraído"
}

Se o texto não contiver informações suficientes para preencher algum dos campos, forneça uma sugestão genérica lógica baseada no contexto global do arquivo.

Texto do Arquivo:
"""
${conteudoTexto.substring(0, 15000)}
"""
`;

  // 1. Tentar OpenRouter se a chave estiver configurada
  if (openRouterApiKey) {
    try {
      console.log(`\n[OPENROUTER] Extraindo dados do plano do arquivo "${nomeArquivo}" via LLM (${openRouterModel})...`);
      const responseText = await chamarOpenRouter(prompt);
      const parsed: DadosProjetoExtraidos = JSON.parse(responseText);
      return {
        titulo: parsed.titulo || 'Projeto de Pesquisa Proposto',
        perguntaPesquisa: parsed.perguntaPesquisa || 'Como investigar o problema proposto no plano de trabalho?',
        nivel: parsed.nivel || 'TCC',
        programa: parsed.programa || 'Geral'
      };
    } catch (error) {
      console.error('Erro ao extrair dados do plano via OpenRouter:', error);
      // Fallback
    }
  }

  if (!genAI) {
    console.log(`\n[GEMINI LLM MOCK] Extraindo dados do plano do arquivo "${nomeArquivo}"...`);
    return {
      titulo: `Desenvolvimento de Sistema de Orientação Acadêmica usando IA (Arquivo: ${nomeArquivo})`,
      perguntaPesquisa: 'Como otimizar a gestão de cronogramas e atas de reuniões de pós-graduação através de resumos estruturados por LLM?',
      nivel: 'MESTRADO',
      programa: 'Ciência da Computação'
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed: DadosProjetoExtraidos = JSON.parse(responseText);

    return {
      titulo: parsed.titulo || 'Projeto de Pesquisa Proposto',
      perguntaPesquisa: parsed.perguntaPesquisa || 'Como investigar o problema proposto no plano de trabalho?',
      nivel: parsed.nivel || 'TCC',
      programa: parsed.programa || 'Geral'
    };
  } catch (error) {
    console.error('Erro ao extrair dados do plano no Gemini:', error);
    return {
      titulo: `Projeto extraído de ${nomeArquivo}`,
      perguntaPesquisa: 'Como investigar o problema proposto no plano de trabalho?',
      nivel: 'TCC',
      programa: 'Geral'
    };
  }
}

export function limparMarkdown(texto: string): string {
  if (!texto) return '';
  return texto
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/##/g, '')
    .replace(/#/g, '')
    .replace(/\/\//g, '')
    .replace(/-\s+/g, '• ')
    .trim();
}

export async function analisarRevisaoTexto(
  textoAnterior: string,
  pedidosCorrecao: string,
  textoNovo: string
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const modelName = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash:free';

  const prompt = `
Você é um consultor acadêmico sênior e avaliador de redação científica.
Compare a versão anterior do texto com a nova versão enviada pelo aluno, com base nos pedidos de correção e observações feitos pelo orientador.

Versão Anterior do Texto:
"""
${textoAnterior}
"""

Pedidos de Ajustes/Correções do Orientador:
"""
${pedidosCorrecao}
"""

Nova Versão do Texto:
"""
${textoNovo}
"""

Instruções para o Parecer:
1. Avalie objetivamente quais dos pedidos de correção do orientador foram atendidos na nova versão do texto.
2. Identifique se ainda há pendências cruciais que não foram resolvidas ou se novos problemas foram inseridos.
3. Responda com um texto de 3 a 5 linhas, de forma extremamente profissional, pragmática, em tom direto de diálogo com o orientador, sem rodeios e SEM usar marcações de markdown (sem asteriscos **, sem hashtags, etc.).
`;

  if (apiKey) {
    try {
      console.log('[OPENROUTER] Analisando atendimento de revisões da seção...');
      const responseText = await chamarOpenRouter(prompt);
      return limparMarkdown(responseText);
    } catch (e) {
      console.error('Erro ao analisar revisão via OpenRouter:', e);
    }
  }

  return 'O aluno atualizou o texto científico conforme solicitado. Compare as versões acima e tome a decisão final de aprovação.';
}

export async function auditarTextoIA(conteudo: string): Promise<{
  classificacao: string;
  confianca: number;
  justificativa: string;
  pontuacao: number;
}> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const modelName = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash:free';

  const prompt = `
Você é um especialista em detecção de textos gerados por Inteligência Artificial. Sua tarefa é analisar o texto fornecido e determinar, com o máximo de precisão possível, se ele foi escrito por um humano ou gerado por uma IA (como ChatGPT, Claude, Gemini, Grok, etc.).

Texto do Aluno a ser analisado:
"""
${conteudo}
"""

Siga rigorosamente estes passos para a análise:
1. Analise o texto considerando os seguintes critérios:
   - Repetição de estruturas e padrões sintáticos
   - Uso excessivo de palavras e frases genéricas ou "neutras"
   - Fluidez excessivamente perfeita e falta de imperfeições humanas (erros leves, hesitações, irregularidades)
   - Vocabulário e tom excessivamente equilibrados ou "seguros"
   - Falta de opinião pessoal marcada, humor sutil, gírias regionais ou referências muito específicas
   - Uso de conectores e transições típicos de modelos de linguagem (ex: "além disso", "é importante ressaltar", "em resumo", "vale destacar")
   - Uniformidade no comprimento das frases e parágrafos
   - Presença de informações genéricas ou superficiais quando o tema permite profundidade

2. Classifique o texto em uma destas categorias:
   - "Altamente provável de ser gerado por IA" (confiança ≥ 80%)
   - "Provavelmente gerado por IA" (confiança entre 60–79%)
   - "Indeterminado / Ambíguo" (confiança entre 40–59%)
   - "Provavelmente escrito por humano" (confiança entre 20–39%)
   - "Altamente provável de ser escrito por humano" (confiança ≤ 19%)

3. Justifique sua conclusão com base nos critérios acima, citando trechos específicos do texto que sustentam sua análise.

4. Ao final, dê uma pontuação de 0 a 100, onde:
   - 0 = definitivamente humano
   - 100 = definitivamente gerado por IA

IMPORTANTE: Você deve formatar a sua resposta estritamente seguindo o padrão de tags abaixo para que possamos realizar o parse. Não use nenhuma outra marcação markdown na resposta além das tags solicitadas:

[CLASSIFICACAO] <Insira aqui o texto exato da categoria selecionada no passo 2, sem aspas>
[CONFIANCA] <Insira aqui apenas o número de 0 a 100 da confiança correspondente>
[JUSTIFICATIVA] <Insira aqui a justificativa do passo 3 e citações, limpa, direta, sem asteriscos markdown>
[PONTUACAO] <Insira aqui apenas o número de 0 a 100 da pontuação do passo 4>
`;

  const fallback = {
    classificacao: 'Indeterminado / Ambíguo',
    confianca: 50,
    justificativa: 'Não foi possível realizar o processamento devido à ausência de chaves de API ou falha de rede.',
    pontuacao: 50
  };

  if (!apiKey) {
    return fallback;
  }

  try {
    console.log('[OPENROUTER] Executando auditoria de IA no texto...');
    const rawResponse = await chamarOpenRouter(prompt);

    // Parse simples via delimitadores
    const matchClassificacao = rawResponse.match(/\[CLASSIFICACAO\](.*)/i);
    const matchConfianca = rawResponse.match(/\[CONFIANCA\](.*)/i);
    const matchJustificativa = rawResponse.match(/\[JUSTIFICATIVA\]([\s\S]*?)(?=\[PONTUACAO\]|$)/i);
    const matchPontuacao = rawResponse.match(/\[PONTUACAO\](.*)/i);

    const classificacao = matchClassificacao ? matchClassificacao[1].trim() : 'Indeterminado / Ambíguo';
    const confianca = matchConfianca ? parseInt(matchConfianca[1].replace(/[^0-9]/g, '')) || 50 : 50;
    const justificativa = matchJustificativa ? limparMarkdown(matchJustificativa[1].trim()) : 'Análise realizada com sucesso.';
    const pontuacao = matchPontuacao ? parseInt(matchPontuacao[1].replace(/[^0-9]/g, '')) || 50 : 50;

    return {
      classificacao,
      confianca,
      justificativa,
      pontuacao
    };
  } catch (e) {
    console.error('Erro na chamada da API de auditoria de IA:', e);
    return fallback;
  }
}
