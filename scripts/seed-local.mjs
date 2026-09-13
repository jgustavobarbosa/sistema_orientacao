/**
 * Seed idempotente para testes locais do SOIA.
 *
 * Uso:
 *   npm run seed:local
 *
 * Credenciais padrão (documentadas em docs/TESTE_LOCAL.md):
 *   Admin/Professor: janioguga@gmail.com / senha123
 *   Aluno Matheus:   matheus@soia.local / senha123
 */

import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const require = createRequire(path.join(root, 'package.json'));
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const bcrypt = require('bcrypt');

const SENHA_LOCAL = process.env.SOIA_LOCAL_PASSWORD || 'senha123';

const ADMIN = {
  email: 'janioguga@gmail.com',
  nome: 'Gustavo Janio',
  papel: 'ADMIN',
};

const ALUNO = {
  email: 'matheus@soia.local',
  nome: 'Matheus (teste local)',
  papel: 'ORIENTANDO',
};

const MONO_ETAPAS = [
  {
    etapa: 'E1_DELIMITACAO',
    ordem: 1,
    titulo: 'Fase Inicial e Introdução',
    secoes: [
      {
        titulo: 'Capítulo 1 - Introdução',
        ordem: 1,
        obrigatoria: true,
        instrucaoPrompt: 'Escreva a introdução apresentando o tema, problema, pergunta, hipóteses e objetivos.',
        criteriosAceite: 'Compreende de forma inequívoca o tema, os objetivos e o problema de estudo.',
      },
    ],
  },
  {
    etapa: 'E2_FUNDAMENTACAO',
    ordem: 2,
    titulo: 'Fundamentação Teórica',
    secoes: [
      {
        titulo: 'Capítulo 2 - Referencial Teórico',
        ordem: 1,
        obrigatoria: true,
        instrucaoPrompt: 'Desenvolva a discussão teórica articulada com autores clássicos e contemporâneos.',
        criteriosAceite: 'Revisão bibliográfica crítica que fundamenta as hipóteses formuladas.',
      },
    ],
  },
  {
    etapa: 'E3_METODO',
    ordem: 3,
    titulo: 'Desenho Metodológico',
    secoes: [
      {
        titulo: 'Capítulo 3 - Metodologia',
        ordem: 1,
        obrigatoria: true,
        instrucaoPrompt: 'Descreva a abordagem, técnicas de amostragem, instrumentos de coleta e tratamento de dados.',
        criteriosAceite: 'Método condizente e com validade científica.',
      },
    ],
  },
  {
    etapa: 'E5_ANALISE',
    ordem: 4,
    titulo: 'Resultados e Discussão',
    secoes: [
      {
        titulo: 'Capítulo 4 - Resultados e Discussões',
        ordem: 1,
        obrigatoria: true,
        instrucaoPrompt: 'Apresente os dados coletados de forma visual e analise comparativamente com a teoria.',
        criteriosAceite: 'Apresenta análises fundamentadas e responde aos objetivos específicos.',
      },
    ],
  },
  {
    etapa: 'E7_PRE_DEFESA',
    ordem: 5,
    titulo: 'Conclusões e Encerramento',
    secoes: [
      {
        titulo: 'Capítulo 5 - Considerações Finais',
        ordem: 1,
        obrigatoria: true,
        instrucaoPrompt: 'Apresente as conclusões do trabalho, limitações, contribuições e recomendações.',
        criteriosAceite: 'Conclusão clara conectada ao objetivo geral.',
      },
    ],
  },
];

const MARCOS_PADRAO = [
  { titulo: 'Plano de Orientação', tipo: 'CHECKLIST', prazoMeses: 1 },
  { titulo: 'Revisão Bibliográfica', tipo: 'REVISAO', prazoMeses: 3 },
  { titulo: 'Qualificação', tipo: 'QUALIFICACAO', prazoMeses: 6 },
  { titulo: 'Escrita do Manuscrito', tipo: 'CAPITULO', prazoMeses: 9 },
  { titulo: 'Defesa Final', tipo: 'DEFESA', prazoMeses: 12 },
];

async function upsertUsuario(prisma, user, senhaHash) {
  return prisma.usuario.upsert({
    where: { email: user.email },
    update: {
      nome: user.nome,
      papel: user.papel,
      senha: senhaHash,
      ativo: true,
      emailConfirmado: true,
      confirmToken: null,
      confirmTokenExp: null,
    },
    create: {
      nome: user.nome,
      email: user.email,
      papel: user.papel,
      senha: senhaHash,
      ativo: true,
      emailConfirmado: true,
    },
  });
}

async function ensureProjeto(prisma, admin, aluno) {
  let projeto = await prisma.projetoOrientacao.findFirst({
    where: { orientandoId: aluno.id },
  });

  if (!projeto) {
    projeto = await prisma.projetoOrientacao.create({
      data: {
        orientadorId: admin.id,
        orientandoId: aluno.id,
        titulo: 'PGI-CCR — Governança da informação na linha de cuidado do câncer colorretal no SUS',
        perguntaPesquisa:
          'Como estruturar um modelo multi-institucional territorial de governança da informação em saúde?',
        nivel: 'MESTRADO',
        modalidade: 'MESTRADO',
        tipoProduto: 'MONO',
        etapaAtual: 'E1_DELIMITACAO',
        status: 'EM_ANDAMENTO',
        programa: 'PPMC',
        temaFrase: 'Governança da informação na linha de cuidado do câncer colorretal no SUS',
        problemaPercebido:
          'Fragmentação dos prontuários eletrônicos em oncologia dificultando o cuidado coordenado.',
        objetivoGeral:
          'Desenvolver e validar um Protocolo de Governança da Informação para a Linha de Cuidado do Câncer Colorretal (PGI-CCR).',
        publicoContexto: 'Atores profissionais e institucionais da linha de cuidado do câncer colorretal no SUS',
        acessoCampo: 'Fontes documentais, dados de campo e dados assistenciais',
        normasEntrega: 'Manual ABNT',
        prazoDefesa: new Date(new Date().setMonth(new Date().getMonth() + 12)),
      },
    });
    console.log('✓ Projeto criado:', projeto.titulo);
  } else {
    projeto = await prisma.projetoOrientacao.update({
      where: { id: projeto.id },
      data: {
        orientadorId: admin.id,
        status: 'EM_ANDAMENTO',
        etapaAtual: projeto.etapaAtual === 'E0_ACOLHIMENTO' ? 'E1_DELIMITACAO' : projeto.etapaAtual,
      },
    });
    console.log('✓ Projeto já existia (atualizado vínculo/status):', projeto.id);
  }

  return projeto;
}

async function ensureMarcos(prisma, projeto, aluno) {
  const existentes = await prisma.marcoAcademico.count({ where: { projetoId: projeto.id } });
  if (existentes > 0) {
    console.log(`✓ Marcos já existem (${existentes})`);
    return;
  }

  const base = new Date();
  for (const marco of MARCOS_PADRAO) {
    const dataPrevista = new Date(base);
    dataPrevista.setMonth(base.getMonth() + marco.prazoMeses);
    await prisma.marcoAcademico.create({
      data: {
        projetoId: projeto.id,
        titulo: marco.titulo,
        tipo: marco.tipo,
        dataPrevista,
        responsavelId: aluno.id,
        status: 'A_FAZER',
      },
    });
  }
  console.log(`✓ ${MARCOS_PADRAO.length} marcos criados`);
}

async function ensureTrilha(prisma, projeto) {
  const etapasCount = await prisma.etapaProjeto.count({ where: { projetoId: projeto.id } });
  if (etapasCount > 0) {
    console.log(`✓ Trilha metodológica já existe (${etapasCount} etapas)`);
    return;
  }

  for (const e of MONO_ETAPAS) {
    const etapaProj = await prisma.etapaProjeto.create({
      data: {
        projetoId: projeto.id,
        etapa: e.etapa,
        ordem: e.ordem,
        titulo: e.titulo,
        statusGate: e.ordem === 1 ? 'LIBERADO' : 'BLOQUEADO',
      },
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
          status: 'PENDENTE',
        },
      });
    }
  }
  console.log(`✓ Trilha MONO instanciada (${MONO_ETAPAS.length} etapas)`);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não definido. Configure o .env na raiz do projeto.');
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  const senhaHash = await bcrypt.hash(SENHA_LOCAL, 10);

  try {
    console.log('\n=== SOIA seed:local ===\n');

    const admin = await upsertUsuario(prisma, ADMIN, senhaHash);
    console.log(`✓ Admin/Professor: ${admin.email} (${admin.papel})`);

    const aluno = await upsertUsuario(prisma, ALUNO, senhaHash);
    console.log(`✓ Aluno: ${aluno.email} (${aluno.papel})`);

    const projeto = await ensureProjeto(prisma, admin, aluno);
    await ensureMarcos(prisma, projeto, aluno);
    await ensureTrilha(prisma, projeto);

    console.log('\n--- Credenciais locais ---');
    console.log(`URL:            http://localhost:3000`);
    console.log(`Admin/Professor ${ADMIN.email} / ${SENHA_LOCAL}`);
    console.log(`Aluno Matheus   ${ALUNO.email} / ${SENHA_LOCAL}`);
    console.log('\nDica: NEXTAUTH_URL=http://localhost:3000 no .env para login local.');
    console.log('Seed idempotente — pode rodar de novo a qualquer momento.\n');
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Falha no seed:local:', err);
  process.exit(1);
});
