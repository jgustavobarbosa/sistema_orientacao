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
  FileText, 
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Award,
  BookOpen,
  Share2
} from 'lucide-react';
import Link from 'next/link';
import { liberarParecer } from '@/app/actions';
import { limparMarkdown } from '@/lib/gemini';

interface VerParecerProps {
  params: Promise<{ id: string }>;
}

export default async function OrientadorVerParecerPage({ params }: VerParecerProps) {
  const session = await getServerSession(authOptions);
  const { id: documentoId } = await params;

  if (!session || session.user.papel !== PapelUsuario.ORIENTADOR && session.user.papel !== PapelUsuario.ADMIN) {
    redirect('/login');
  }

  // Buscar o documento e o parecer LLM
  const documento = await prisma.documento.findUnique({
    where: { id: documentoId },
    include: {
      parecerLLM: true,
      projeto: {
        include: { orientando: true }
      }
    }
  });

  if (!documento || !documento.parecerLLM) {
    redirect('/orientador');
  }

  // REGRA DE SEGURANÇA MÁXIMA (RNF-02): Logar visualização de dados de inteligência privada
  await registrarLogAuditoria({
    usuarioId: session.user.id,
    acao: 'VER_PARECER',
    recurso: `Documento/${documentoId}`,
    detalhes: `Orientador visualizou parecer LLM do documento: ${documento.titulo}`
  });

  const parecer = documento.parecerLLM;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Voltar */}
      <Link
        href={`/orientador/alunos/${documento.projeto.orientandoId}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar à página do aluno
      </Link>

      {/* Cabeçalho */}
      <div className="border-b border-slate-900/60 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md">
              PARECER DE IA
            </span>
            {parecer.parecerLiberado ? (
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-450" />
                Compartilhado com o Aluno
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full">
                Privado ao Orientador
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2 mt-1">
            <Sparkles className="h-8 w-8 text-indigo-400 shrink-0" />
            Análise do Manuscrito
          </h1>
          <p className="text-slate-400 text-sm">
            Documento: <span className="font-semibold text-slate-350">{documento.titulo}</span> | Enviado por: {documento.projeto.orientando.nome}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="text-xs text-slate-500">
            Gerado em: {new Date(parecer.geradoEm).toLocaleString('pt-BR')}
          </div>
          {!parecer.parecerLiberado && (
            <form action={liberarParecer.bind(null, parecer.id, documento.id)}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5" />
                Liberar para o Aluno
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Painel Esquerdo: Resumo Executivo */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-2xl border border-slate-900/60 flex flex-col space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-900/60 pb-3">
              <BookOpen className="h-5 w-5 text-indigo-400 shrink-0" />
              <h3 className="font-bold text-slate-200">Resumo Executivo</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {limparMarkdown(parecer.resumo)}
            </p>
            <div className="text-[10px] text-slate-500 border-t border-slate-900/40 pt-3 flex justify-between">
              <span>Modelo Utilizado:</span>
              <span className="font-mono">{parecer.modeloUsado}</span>
            </div>
          </div>
        </div>

        {/* Painel Direito: Pontos Fortes, Lacunas e Orientações */}
        <div className="lg:col-span-2 space-y-8">
          {/* Pontos Fortes */}
          <div className="glass p-6 rounded-2xl border border-slate-900/60 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-900/60 pb-3 text-emerald-400">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <h3 className="font-bold text-slate-200">Pontos Fortes</h3>
            </div>
            <div className="text-slate-300 text-sm leading-relaxed prose prose-invert max-w-none">
              {limparMarkdown(parecer.pontosFortes).split('\n').map((line, i) => (
                <p key={i} className="my-1.5">{line}</p>
              ))}
            </div>
          </div>

          {/* Lacunas e Riscos */}
          <div className="glass p-6 rounded-2xl border border-slate-900/60 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-900/60 pb-3 text-amber-500">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <h3 className="font-bold text-slate-200">Lacunas e Riscos Metodológicos</h3>
            </div>
            <div className="text-slate-300 text-sm leading-relaxed prose prose-invert max-w-none">
              {limparMarkdown(parecer.lacunas).split('\n').map((line, i) => (
                <p key={i} className="my-1.5">{line}</p>
              ))}
            </div>
          </div>

          {/* Recomendações de Orientação */}
          <div className="glass p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-slate-950 via-indigo-950/10 to-slate-950 space-y-4 shadow-lg shadow-indigo-500/5">
            <div className="flex items-center gap-3 border-b border-slate-900/60 pb-3 text-indigo-400">
              <Award className="h-5 w-5 shrink-0" />
              <h3 className="font-bold text-slate-200">Orientações Recomendadas para o Aluno</h3>
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
