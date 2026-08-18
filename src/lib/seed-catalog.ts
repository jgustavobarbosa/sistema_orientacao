import { prisma } from './db';
import { TipoProdutoAcademico, EtapaOrientacao } from '@prisma/client';

export async function seedCatalog() {
  try {
    // 1. Verificar se já existem modelos no catálogo
    const count = await prisma.modeloCatalogo.count();
    if (count > 0) {
      console.log('[SOIA SEED] Catálogo de modelos acadêmicos já populado.');
      return;
    }

    console.log('[SOIA SEED] Iniciando seed do catálogo de modelos acadêmicos...');

    // Definição dos 4 modelos essenciais (Core P0)
    const modelos = [
      {
        codigo: TipoProdutoAcademico.PROJ_PESQ,
        nome: 'Projeto de Pesquisa Científica',
        descricao: 'Estruturação metodológica e teórica antes da coleta ou desenvolvimento de dados.',
        etapas: [
          {
            etapa: EtapaOrientacao.E1_DELIMITACAO,
            ordem: 1,
            titulo: 'Delimitação e Problema',
            secoes: [
              {
                titulo: '1. Introdução e Delimitação',
                ordem: 1,
                obrigatoria: true,
                instrucaoPrompt: 'Apresente o tema, delimite o problema científico ou prático e contextualize a pesquisa.',
                criteriosAceite: 'O problema de pesquisa está claramente delimitado e não é apenas genérico.'
              },
              {
                titulo: '2. Pergunta e Objetivos',
                ordem: 2,
                obrigatoria: true,
                instrucaoPrompt: 'Descreva a pergunta orientadora e defina o objetivo geral acompanhado dos específicos.',
                criteriosAceite: 'A pergunta de pesquisa responde ao problema e os objetivos indicam resultados concretos.'
              }
            ]
          },
          {
            etapa: EtapaOrientacao.E2_FUNDAMENTACAO,
            ordem: 2,
            titulo: 'Revisão e Teoria',
            secoes: [
              {
                titulo: '3. Fundamentação Teórica Preliminar',
                ordem: 1,
                obrigatoria: true,
                instrucaoPrompt: 'Apresente a fundamentação bibliográfica e conceitos-chave da literatura.',
                criteriosAceite: 'Conceitos centrais discutidos com referências consistentes.'
              }
            ]
          },
          {
            etapa: EtapaOrientacao.E3_METODO,
            ordem: 3,
            titulo: 'Abordagem Metodológica',
            secoes: [
              {
                titulo: '4. Delineamento Metodológico',
                ordem: 1,
                obrigatoria: true,
                instrucaoPrompt: 'Escreva a metodologia de pesquisa, universo, coleta e protocolo analítico planejado.',
                criteriosAceite: 'O percurso metodológico é reprodutível e condizente com os objetivos.'
              }
            ]
          }
        ]
      },
      {
        codigo: TipoProdutoAcademico.MONO,
        nome: 'Monografia Acadêmica Tradicional',
        descricao: 'Trabalho de conclusão estruturado por capítulos lineares conforme as normas institucionais.',
        etapas: [
          {
            etapa: EtapaOrientacao.E1_DELIMITACAO,
            ordem: 1,
            titulo: 'Fase Inicial e Introdução',
            secoes: [
              {
                titulo: 'Capítulo 1 - Introdução',
                ordem: 1,
                obrigatoria: true,
                instrucaoPrompt: 'Escreva a introdução apresentando o tema, problema, pergunta, hipóteses e objetivos.',
                criteriosAceite: 'Compreende de forma inequívoca o tema, os objetivos e o problema de estudo.'
              }
            ]
          },
          {
            etapa: EtapaOrientacao.E2_FUNDAMENTACAO,
            ordem: 2,
            titulo: 'Fundamentação Teórica',
            secoes: [
              {
                titulo: 'Capítulo 2 - Referencial Teórico',
                ordem: 1,
                obrigatoria: true,
                instrucaoPrompt: 'Desenvolva a discussão teórica articulada com autores clássicos e contemporâneos.',
                criteriosAceite: 'Revisão bibliográfica crítica que fundamenta as hipóteses formuladas.'
              }
            ]
          },
          {
            etapa: EtapaOrientacao.E3_METODO,
            ordem: 3,
            titulo: 'Desenho Metodológico',
            secoes: [
              {
                titulo: 'Capítulo 3 - Metodologia',
                ordem: 1,
                obrigatoria: true,
                instrucaoPrompt: 'Descreva a abordagem, técnicas de amostragem, instrumentos de coleta e tratamento de dados.',
                criteriosAceite: 'Método condizente e com validade científica.'
              }
            ]
          },
          {
            etapa: EtapaOrientacao.E5_ANALISE,
            ordem: 4,
            titulo: 'Resultados e Discussão',
            secoes: [
              {
                titulo: 'Capítulo 4 - Resultados e Discussões',
                ordem: 1,
                obrigatoria: true,
                instrucaoPrompt: 'Apresente os dados coletados de forma visual e analise comparativamente com a teoria.',
                criteriosAceite: 'Apresenta análises fundamentadas e responde aos objetivos específicos.'
              }
            ]
          },
          {
            etapa: EtapaOrientacao.E7_PRE_DEFESA,
            ordem: 5,
            titulo: 'Conclusões e Encerramento',
            secoes: [
              {
                titulo: 'Capítulo 5 - Considerações Finais',
                ordem: 1,
                obrigatoria: true,
                instrucaoPrompt: 'Apresente as conclusões do trabalho, limitações, contribuições e recomendações.',
                criteriosAceite: 'Conclusão clara conectada ao objetivo geral.'
              }
            ]
          }
        ]
      },
      {
        codigo: TipoProdutoAcademico.ART_EMP,
        nome: 'Artigo Científico Empírico',
        descricao: 'Manuscrito estruturado focado em dados experimentais, campo, estudo de caso ou intervenção.',
        etapas: [
          {
            etapa: EtapaOrientacao.E1_DELIMITACAO,
            ordem: 1,
            titulo: 'Introdução e Objetivos',
            secoes: [
              {
                titulo: 'Introdução',
                ordem: 1,
                obrigatoria: true,
                instrucaoPrompt: 'Desenvolva o escopo, justificativa, problema e a pergunta orientadora do artigo.',
                criteriosAceite: 'Apresentação clara da importância científica do estudo.'
              }
            ]
          },
          {
            etapa: EtapaOrientacao.E3_METODO,
            ordem: 2,
            titulo: 'Metodologia e Coleta',
            secoes: [
              {
                titulo: 'Metodologia / Materiais e Métodos',
                ordem: 1,
                obrigatoria: true,
                instrucaoPrompt: 'Detalhamento do desenho do estudo, dados coletados e técnicas estatísticas/qualitativas.',
                criteriosAceite: 'Permite reprodutibilidade total do experimento ou análise.'
              }
            ]
          },
          {
            etapa: EtapaOrientacao.E5_ANALISE,
            ordem: 3,
            titulo: 'Resultados e Discussão',
            secoes: [
              {
                titulo: 'Resultados',
                ordem: 1,
                obrigatoria: true,
                instrucaoPrompt: 'Apresente os achados empíricos organizados por figuras, tabelas e gráficos.',
                criteriosAceite: 'Apresentação direta sem juízo de valor das evidências coletadas.'
              },
              {
                titulo: 'Discussão',
                ordem: 2,
                obrigatoria: true,
                instrucaoPrompt: 'Discuta o impacto dos resultados frente à literatura de referência.',
                criteriosAceite: 'Posicionamento claro do artigo em relação aos conhecimentos existentes.'
              }
            ]
          },
          {
            etapa: EtapaOrientacao.E7_PRE_DEFESA,
            ordem: 4,
            titulo: 'Conclusões e Referências',
            secoes: [
              {
                titulo: 'Conclusão',
                ordem: 1,
                obrigatoria: true,
                instrucaoPrompt: 'Resuma os principais achados, limites da pesquisa e trabalhos futuros.',
                criteriosAceite: 'Parágrafos claros e sem novas citações bibliográficas.'
              }
            ]
          }
        ]
      },
      {
        codigo: TipoProdutoAcademico.PROD_TEC,
        nome: 'Produto Técnico ou Tecnológico',
        descricao: 'Guia, protocolo, software, modelo ou processo acompanhado de memorial descritivo.',
        etapas: [
          {
            etapa: EtapaOrientacao.E1_DELIMITACAO,
            ordem: 1,
            titulo: 'Delimitação e Requisitos',
            secoes: [
              {
                titulo: '1. Diagnóstico do Problema Prático',
                ordem: 1,
                obrigatoria: true,
                instrucaoPrompt: 'Apresente o problema do setor prático ou organizacional que motivou a intervenção.',
                criteriosAceite: 'Identifica uma dor organizacional real e com justificativa prática.'
              }
            ]
          },
          {
            etapa: EtapaOrientacao.E3_METODO,
            ordem: 2,
            titulo: 'Método de Desenvolvimento',
            secoes: [
              {
                titulo: '2. Procedimento de Criação do Produto',
                ordem: 1,
                obrigatoria: true,
                instrucaoPrompt: 'Explique o método técnico-científico utilizado para modelar ou codificar o produto.',
                criteriosAceite: 'Descreve com clareza a engenharia ou modelagem do produto.'
              }
            ]
          },
          {
            etapa: EtapaOrientacao.E4_COLETA_DESENVOLVIMENTO,
            ordem: 3,
            titulo: 'Desenvolvimento do Produto',
            secoes: [
              {
                titulo: '3. Memorial Descritivo e Protótipo',
                ordem: 1,
                obrigatoria: true,
                instrucaoPrompt: 'Apresente o protótipo, telas, modelo conceitual ou fluxograma final.',
                criteriosAceite: 'Mapeamento visual ou arquitetural completo do artefato gerado.'
              }
            ]
          },
          {
            etapa: EtapaOrientacao.E5_ANALISE,
            ordem: 4,
            titulo: 'Validação e Aplicação',
            secoes: [
              {
                titulo: '4. Testes e Validação de Campo',
                ordem: 1,
                obrigatoria: true,
                instrucaoPrompt: 'Descreva os testes práticos efetuados e a avaliação/satisfação dos usuários finais.',
                criteriosAceite: 'Apresenta laudo ou evidência clara de testes com usuários reais ou validação por especialistas.'
              }
            ]
          }
        ]
      }
    ];

    // Persistir todos os modelos de forma sequencial
    for (const m of modelos) {
      const modeloDb = await prisma.modeloCatalogo.create({
        data: {
          codigo: m.codigo,
          nome: m.nome,
          descricao: m.descricao,
          versao: 1
        }
      });

      for (const e of m.etapas) {
        const etapaDb = await prisma.etapaCatalogo.create({
          data: {
            modeloId: modeloDb.id,
            etapa: e.etapa,
            ordem: e.ordem,
            titulo: e.titulo
          }
        });

        for (const s of e.secoes) {
          await prisma.secaoCatalogo.create({
            data: {
              etapaId: etapaDb.id,
              titulo: s.titulo,
              ordem: s.ordem,
              obrigatoria: s.obrigatoria,
              instrucaoPrompt: s.instrucaoPrompt,
              criteriosAceite: s.criteriosAceite
            }
          });
        }
      }
    }

    console.log('[SOIA SEED] Catálogo de modelos acadêmicos populado com sucesso!');
  } catch (error) {
    console.error('❌ [SOIA SEED ERROR] Falha ao seedar catálogo de modelos:', error);
  }
}
