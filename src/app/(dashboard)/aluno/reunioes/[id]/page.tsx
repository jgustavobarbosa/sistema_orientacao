import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PapelUsuario } from '@prisma/client';
import { registrarLogAuditoria } from '@/lib/audit';
import { 
  Calendar, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  FileText,
  User,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface VerAtaProps {
  params: Promise<{ id: string }>;
}

export default async function AlunoVerAtaPage({ params }: VerAtaProps) {
  const session = await getServerSession(authOptions);
  const { id: reuniaoId } = await params;

  if (!session || session.user.papel !== PapelUsuario.ORIENTANDO) {
    redirect('/login');
  }

  // Buscar a reunião
  const reuniao = await prisma.reuniao.findUnique({
    where: { id: reuniaoId },
    include: {
      projeto: {
        include: { orientador: true }
      }
    }
  });

  if (!reuniao) {
    redirect('/aluno');
  }

  // REGRA DE ISOLAMENTO ESTRETO (UC-10): Aluno só pode acessar a reunião se ela pertencer ao seu projeto
  if (reuniao.projeto.orientandoId !== session.user.id) {
    await registrarLogAuditoria({
      usuarioId: session.user.id,
      acao: 'TENTATIVA_403',
      recurso: `Reuniao/${reuniaoId}`,
      detalhes: `Aluno tentou ler ata de outro aluno. Projeto da ata: ${reuniao.projeto.id}`
    });
    redirect('/aluno?error=AcessoNegado');
  }

  // Decodificar dados estruturados (JSONB)
  const sinteseAvanco = (reuniao.sinteseAvanco || []) as any[];
  const decisoes = (reuniao.decisoes || []) as any[];
  const riscos = (reuniao.riscos || []) as any[];
  const planoTrabalho = (reuniao.planoTrabalho || []) as any[];
  const perguntasProximaEntrega = (reuniao.perguntasProximaEntrega || []) as string[];
  const proximoEncontro = (reuniao.proximoEncontro || {}) as any;

  return (
    <div className="space-y-8 animate-in fade-in duration-350">
      {/* Voltar */}
      <Link
        href="/aluno"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao meu espaço
      </Link>

      {/* Título */}
      <div className="border-b border-slate-900/60 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8 text-indigo-400 shrink-0" />
            Ata do Encontro #{reuniao.numeroEncontro}
          </h1>
          <p className="text-slate-400 text-sm">
            Orientador: <span className="font-semibold text-slate-300">{reuniao.projeto.orientador.nome}</span> | Projeto: {reuniao.projeto.titulo}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl">
          <Calendar className="h-3.5 w-3.5 text-slate-500" />
          Realizado em {new Date(reuniao.dataHoraInicio).toLocaleString('pt-BR')}
        </div>
      </div>

      <div className="space-y-10">
        {/* SEÇÃO 1: CABEÇALHO */}
        <div className="glass p-6 rounded-2xl border border-slate-900/60 space-y-4">
          <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">
            1. Informações de Cabeçalho
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            <div className="space-y-0.5">
              <span className="text-xs text-slate-500 block">Pergunta de Pesquisa Vigente</span>
              <span className="font-semibold text-slate-200">{reuniao.perguntaVigente || 'Não informada'}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs text-slate-500 block">Produto em Desenvolvimento</span>
              <span className="font-semibold text-slate-200">{reuniao.produtoEmDesenvolvimento || 'Não informado'}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs text-slate-500 block">Versão do Material Analisado</span>
              <span className="font-semibold text-slate-200">{reuniao.versaoMaterial || 'Não informada'}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs text-slate-500 block">Cronograma</span>
              <span className={`inline-flex items-center gap-1.5 font-bold text-xs ${
                reuniao.situacaoCronograma === 'VERDE' ? 'text-emerald-400' : reuniao.situacaoCronograma === 'AMARELO' ? 'text-amber-400' : 'text-red-400'
              }`}>
                {reuniao.situacaoCronograma === 'VERDE' ? '🟢 Em dia (Verde)' : reuniao.situacaoCronograma === 'AMARELO' ? '🟡 Atenção (Amarelo)' : '🔴 Atrasado (Vermelho)'}
              </span>
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: SÍNTESE DO AVANÇO */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">
            2. Síntese do Avanço desde o Encontro Anterior
          </h3>
          <div className="glass rounded-2xl border border-slate-900/60 overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-900/40 border-b border-slate-900/60 text-slate-400 text-xs font-semibold uppercase">
                  <th className="px-6 py-3.5 w-[35%]">Entrega Prevista</th>
                  <th className="px-6 py-3.5 w-[20%]">Situação</th>
                  <th className="px-6 py-3.5 w-[25%]">Evidência / Link</th>
                  <th className="px-6 py-3.5 w-[20%]">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40">
                {sinteseAvanco.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/10 transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-slate-200">{item.entrega}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.situacao.includes('Entregue') && !item.situacao.includes('Parcialmente')
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : item.situacao.includes('Parcialmente')
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {item.situacao}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      {item.link ? (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline font-medium truncate block max-w-xs">
                          Ver material
                        </a>
                      ) : (
                        <span className="text-slate-500 italic">Nenhum</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-slate-400 text-xs">{item.observacao || 'Sem observações'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SEÇÃO 3: DECISÕES TOMADAS */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">
            3. Decisões Tomadas e Deliberações
          </h3>
          <div className="glass rounded-2xl border border-slate-900/60 overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-900/40 border-b border-slate-900/60 text-slate-400 text-xs font-semibold uppercase">
                  <th className="px-6 py-3.5 w-[30%]">Decisão / Acordo</th>
                  <th className="px-6 py-3.5 w-[30%]">Justificativa Acadêmica</th>
                  <th className="px-6 py-3.5 w-[25%]">Impacto no Escopo</th>
                  <th className="px-6 py-3.5 w-[15%]">Responsável</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40">
                {decisoes.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/10 transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-slate-200">{item.decisao}</td>
                    <td className="px-6 py-3.5 text-slate-400 text-xs leading-relaxed">{item.justificativa}</td>
                    <td className="px-6 py-3.5 text-slate-400 text-xs leading-relaxed">{item.impacto}</td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-md text-xs font-semibold">
                        {item.responsavel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SEÇÃO 4: QUESTÕES CRÍTICAS E RISCOS */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">
            4. Questões Críticas e Riscos Detectados
          </h3>
          <div className="glass rounded-2xl border border-slate-900/60 overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-900/40 border-b border-slate-900/60 text-slate-400 text-xs font-semibold uppercase">
                  <th className="px-6 py-3.5 w-[20%]">Dimensão</th>
                  <th className="px-6 py-3.5 w-[35%]">Situação Observada</th>
                  <th className="px-6 py-3.5 w-[15%]">Nível de Risco</th>
                  <th className="px-6 py-3.5 w-[20%]">Ação de Mitigação</th>
                  <th className="px-6 py-3.5 w-[10%]">Revisão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40">
                {riscos.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/10 transition-colors">
                    <td className="px-6 py-3.5 text-slate-300 font-semibold">{item.dimensao}</td>
                    <td className="px-6 py-3.5 text-slate-400 text-xs leading-relaxed">{item.situacao}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 font-bold text-xs ${
                        item.nivelRisco === 'ALTO' ? 'text-red-400' : item.nivelRisco === 'MEDIO' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {item.nivelRisco === 'ALTO' ? '🔴 Alto' : item.nivelRisco === 'MEDIO' ? '🟡 Médio' : '🟢 Baixo'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-400 text-xs leading-relaxed">{item.mitigacao}</td>
                    <td className="px-6 py-3.5 text-slate-500 text-xs">
                      {item.revisao ? new Date(item.revisao).toLocaleDateString('pt-BR') : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SEÇÃO 5: PLANO DE TRABALHO */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">
            5. Plano de Trabalho até o Próximo Encontro
          </h3>
          <div className="glass rounded-2xl border border-slate-900/60 overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-900/40 border-b border-slate-900/60 text-slate-400 text-xs font-semibold uppercase">
                  <th className="px-6 py-3.5 w-[40%]">Tarefa</th>
                  <th className="px-6 py-3.5 w-[30%]">Produto / Critério de Aceite</th>
                  <th className="px-6 py-3.5 w-[20%]">Prazo Limite</th>
                  <th className="px-6 py-3.5 w-[10%]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40">
                {planoTrabalho.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/10 transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-slate-200">{item.tarefa}</td>
                    <td className="px-6 py-3.5 text-slate-400 text-xs">{item.produto}</td>
                    <td className="px-6 py-3.5 text-slate-500 text-xs">
                      {item.prazo ? new Date(item.prazo).toLocaleDateString('pt-BR') : 'N/A'}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="h-3.5 w-3.5 text-slate-600" />
                        Pendente
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SEÇÃO 6: PERGUNTAS NORTEADORAS */}
          <div className="glass p-6 rounded-2xl border border-slate-900/60 space-y-4">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-900/60 pb-3">
              6. Perguntas Orientadoras da Próxima Entrega
            </h3>
            {perguntasProximaEntrega.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">Nenhuma pergunta formulada.</p>
            ) : (
              <ul className="space-y-3.5">
                {perguntasProximaEntrega.map((pergunta, idx) => (
                  <li key={idx} className="flex gap-3 text-sm leading-relaxed">
                    <HelpCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                    <span className="text-slate-200 font-medium">{pergunta}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* SEÇÃO 7: PRÓXIMO ENCONTRO */}
          <div className="glass p-6 rounded-2xl border border-slate-900/60 space-y-4">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-900/60 pb-3">
              7. Alinhamento do Próximo Encontro
            </h3>
            <div className="space-y-4 text-sm">
              {proximoEncontro.dataHora && (
                <div className="flex gap-3">
                  <Clock className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-500 block">Agendado para</span>
                    <span className="font-semibold text-slate-200">
                      {new Date(proximoEncontro.dataHora).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              )}
              {proximoEncontro.materialPrevio && (
                <div className="flex gap-3 border-t border-slate-900/40 pt-3">
                  <FileText className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-500 block">Material a encaminhar (72h de antecedência)</span>
                    <span className="text-slate-300 text-xs leading-relaxed block mt-0.5">{proximoEncontro.materialPrevio}</span>
                  </div>
                </div>
              )}
              {proximoEncontro.destravamentos && proximoEncontro.destravamentos.length > 0 && (
                <div className="flex gap-3 border-t border-slate-900/40 pt-3">
                  <AlertTriangle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-500 block">Três decisões que o aluno precisa destravar</span>
                    <ul className="list-decimal pl-4 text-xs text-slate-300 mt-1 space-y-1">
                      {proximoEncontro.destravamentos.map((d: string, i: number) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {proximoEncontro.criterioAdequado && (
                <div className="flex gap-3 border-t border-slate-900/40 pt-3">
                  <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-500 block">Critério para considerar a entrega adequada</span>
                    <span className="text-slate-300 text-xs leading-relaxed block mt-0.5">{proximoEncontro.criterioAdequado}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
