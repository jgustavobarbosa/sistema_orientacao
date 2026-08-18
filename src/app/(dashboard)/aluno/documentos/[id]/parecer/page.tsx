import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PapelUsuario } from '@prisma/client';
import { registrarLogAuditoria } from '@/lib/audit';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { limparMarkdown } from '@/lib/gemini';

interface AlunoVerParecerProps {
  params: Promise<{ id: string }>;
}

export default async function AlunoVerParecerPage({ params }: AlunoVerParecerProps) {
  const session = await getServerSession(authOptions);
  const { id: documentoId } = await params;

  if (!session || session.user.papel !== PapelUsuario.ORIENTANDO) {
    redirect('/login');
  }

  // Buscar o documento e o parecer LLM correspondentes
  const documento = await prisma.documento.findUnique({
    where: { id: documentoId },
    include: {
      parecerLLM: true,
      projeto: true
    }
  });

  // Garantir isolamento (RNF-02): O documento deve pertencer ao projeto do aluno logado
  if (!documento || !documento.parecerLLM || documento.projeto.orientandoId !== session.user.id) {
    redirect('/aluno/documentos');
  }

  // Garantir que o parecer foi de fato liberado para o aluno pelo orientador
  if (!documento.parecerLLM.parecerLiberado) {
    redirect('/aluno/documentos');
  }

  // Logar visualização do parecer
  await registrarLogAuditoria({
    usuarioId: session.user.id,
    acao: 'ALUNO_VER_PARECER',
    recurso: `Documento/${documentoId}`,
    detalhes: `Aluno visualizou as observações liberadas da IA sobre o documento: ${documento.titulo}`
  });

  const parecer = documento.parecerLLM;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Voltar */}
      <Link
        href="/aluno/documentos"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar aos documentos
      </Link>

      {/* Cabeçalho */}
      <div className="border-b border-slate-900/60 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md">
              OBSERVAÇÕES COMPARTILHADAS
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2 mt-1">
            <Sparkles className="h-8 w-8 text-indigo-400 shrink-0" />
            Análise do Orientador (IA)
          </h1>
          <p className="text-slate-400 text-sm">
            Documento: <span className="font-semibold text-slate-350">{documento.titulo}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Painel Esquerdo: Diagnóstico Rápido */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-2xl border border-slate-900/60 flex flex-col space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-900/60 pb-3">
              <BookOpen className="h-5 w-5 text-indigo-400 shrink-0" />
              <h3 className="font-bold text-slate-200">Diagnóstico Rápido</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {limparMarkdown(parecer.resumo)}
            </p>
          </div>
        </div>

        {/* Painel Direito: Sugestões de Ajustes, Demanda Específica e Próximos Passos */}
        <div className="lg:col-span-2 space-y-8">
          {/* Sugestões de Ajustes */}
          <div className="glass p-6 rounded-2xl border border-slate-900/60 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-900/60 pb-3 text-indigo-400">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <h3 className="font-bold text-slate-200">Sugestões de Ajustes</h3>
            </div>
            <div className="text-slate-300 text-sm leading-relaxed prose prose-invert max-w-none">
              {limparMarkdown(parecer.pontosFortes).split('\n').map((line, i) => (
                <p key={i} className="my-1.5">{line}</p>
              ))}
            </div>
          </div>

          {/* Análise de Demanda / Critérios */}
          <div className="glass p-6 rounded-2xl border border-slate-900/60 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-900/60 pb-3 text-amber-500">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <h3 className="font-bold text-slate-200">Triagem do Recorte & Dados</h3>
            </div>
            <div className="text-slate-300 text-sm leading-relaxed prose prose-invert max-w-none">
              {limparMarkdown(parecer.lacunas).split('\n').map((line, i) => (
                <p key={i} className="my-1.5">{line}</p>
              ))}
            </div>
          </div>

          {/* Próximos Passos */}
          <div className="glass p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-slate-950 via-indigo-950/10 to-slate-950 space-y-4 shadow-lg shadow-indigo-500/5">
            <div className="flex items-center gap-3 border-b border-slate-900/60 pb-3 text-indigo-400">
              <Award className="h-5 w-5 shrink-0" />
              <h3 className="font-bold text-slate-200">Próximos Passos para a Orientação</h3>
            </div>
            <div className="text-slate-300 text-sm leading-relaxed prose prose-invert max-w-none">
              {limparMarkdown(parecer.orientacoesProximasEtapas).split('\n').map((line, i) => (
                <p key={i} className="my-1.5">{line}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
