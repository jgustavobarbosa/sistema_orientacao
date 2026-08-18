import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PapelUsuario, CategoriaDocumento } from '@prisma/client';
import { FileText, Upload, CheckCircle2, ShieldAlert } from 'lucide-react';
import { enviarDocumento } from '@/app/actions';
import Link from 'next/link';

export default async function AlunoDocumentosPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.papel !== PapelUsuario.ORIENTANDO) {
    redirect('/login');
  }

  // Buscar projeto do aluno
  const projeto = await prisma.projetoOrientacao.findFirst({
    where: { orientandoId: session.user.id }
  });

  if (!projeto) {
    redirect('/aluno');
  }

  // Buscar documentos enviados pelo aluno para este projeto
  const documentos = await prisma.documento.findMany({
    where: { projetoId: projeto.id },
    include: { parecerLLM: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Meus Documentos</h1>
        <p className="text-slate-400 mt-1">
          Suba manuscritos, relatórios e capítulos para revisão do orientador.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-1 glass p-6 rounded-2xl border border-slate-900/60 flex flex-col space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <Upload className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-200">Enviar Documento</h2>
          </div>

          <form action={enviarDocumento} className="space-y-4">
            <input type="hidden" name="projetoId" value={projeto.id} />
            <input type="hidden" name="alunoId" value={session.user.id} />

            <div className="space-y-1.5">
              <label htmlFor="titulo" className="text-xs font-semibold text-slate-400">
                Título do Documento
              </label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                required
                placeholder="Ex: Introdução - Versão Final"
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="categoria" className="text-xs font-semibold text-slate-400">
                Categoria
              </label>
              <select
                id="categoria"
                name="categoria"
                required
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
              >
                <option value={CategoriaDocumento.MANUSCRITO}>Manuscrito / Artigo</option>
                <option value={CategoriaDocumento.CAPITULO}>Capítulo de Tese/Dissertação</option>
                <option value={CategoriaDocumento.PLANO_PESQUISA}>Plano de Pesquisa</option>
                <option value={CategoriaDocumento.DATASET}>Dataset / Dados</option>
                <option value={CategoriaDocumento.SLIDES}>Apresentação / Slides</option>
                <option value={CategoriaDocumento.OUTRO}>Outro</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="arquivo" className="text-xs font-semibold text-slate-400">
                Arquivo (PDF, DOCX, ZIP)
              </label>
              <input
                type="file"
                id="arquivo"
                name="arquivo"
                required
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 file:cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              Fazer Upload
            </button>
          </form>
        </div>

        {/* Lista de Documentos */}
        <div className="lg:col-span-2 glass rounded-2xl border border-slate-900/60 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-900/60 flex items-center justify-between">
            <h3 className="font-bold text-slate-200">Arquivos Compartilhados</h3>
            <span className="text-xs font-medium px-2.5 py-1 bg-slate-800 text-slate-400 rounded-full">
              {documentos.length} Documento(s)
            </span>
          </div>

          {documentos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-3">
              <FileText className="h-10 w-10 text-slate-650" />
              <p className="text-sm text-slate-400 font-medium">Nenhum documento compartilhado ainda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-900/60 text-slate-400 text-xs font-semibold uppercase bg-slate-900/10">
                    <th className="px-6 py-4">Arquivo / Categoria</th>
                    <th className="px-6 py-4">Tamanho</th>
                    <th className="px-6 py-4">Data de Envio</th>
                    <th className="px-6 py-4">Status LLM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/40">
                  {documentos.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-200 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
                          {doc.titulo}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {doc.categoria} | v{doc.versao}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {doc.tamanhoBytes 
                          ? `${(Number(doc.tamanhoBytes) / (1024 * 1024)).toFixed(2)} MB`
                          : 'N/A'
                        }
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        {doc.parecerLLM?.parecerLiberado ? (
                          <Link
                            href={`/aluno/documentos/${doc.id}/parecer`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer font-bold"
                          >
                            Ver Parecer
                          </Link>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 border border-slate-700 text-slate-400" title="O parecer da IA é visível somente para o Orientador.">
                            Privado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
