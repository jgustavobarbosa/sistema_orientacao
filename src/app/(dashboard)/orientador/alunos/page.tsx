import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PapelUsuario } from '@prisma/client';
import { UserPlus, Shield, ShieldAlert, CheckCircle, XCircle, Trash2, Edit3, AlertCircle } from 'lucide-react';
import { criarAluno, alternarStatus, removerAluno, editarAluno } from '@/app/actions';

interface AlunosPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AlunosPage({ searchParams }: AlunosPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.papel !== PapelUsuario.ORIENTADOR) {
    redirect('/login');
  }

  const { error } = await searchParams;

  let errorMsg = '';
  if (error) {
    switch (error) {
      case 'EmailDuplicado':
        errorMsg = 'Este e-mail já está cadastrado no sistema.';
        break;
      case 'EmailInvalido':
        errorMsg = 'Por favor, informe um e-mail com formato válido (ex: joao@gmail.com).';
        break;
      case 'CamposObrigatorios':
        errorMsg = 'Todos os campos do cadastro são obrigatórios.';
        break;
      default:
        errorMsg = 'Erro ao processar a operação.';
    }
  }

  // Buscar todos os usuários que são alunos (excluindo orientadores)
  const alunos = await prisma.usuario.findMany({
    where: {
      papel: PapelUsuario.ORIENTANDO,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Gestão de Alunos</h1>
        <p className="text-slate-400 mt-1">
          Cadastre novos orientandos e controle a permissão de acesso ao sistema.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm animate-in fade-in duration-200">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Painel Lateral de Cadastro */}
        <div className="lg:col-span-1 glass p-6 rounded-2xl border border-slate-900/60 flex flex-col space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <UserPlus className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-200">Novo Orientando</h2>
          </div>

          <form action={criarAluno} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="nome" className="text-xs font-semibold text-slate-400">
                Nome do Aluno
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                required
                placeholder="Ex: João da Silva"
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-slate-100 text-sm placeholder-slate-600 transition-all outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-400">
                E-mail (Google Account)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="Ex: joao@gmail.com"
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-slate-100 text-sm placeholder-slate-600 transition-all outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ativo" className="text-xs font-semibold text-slate-400">
                Acesso Inicial
              </label>
              <select
                id="ativo"
                name="ativo"
                defaultValue="true"
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-slate-100 text-sm transition-all outline-none"
              >
                <option value="true">Autorizado (Ativo)</option>
                <option value="false">Pendente de Autorização</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              Adicionar Aluno
            </button>
          </form>
        </div>

        {/* Tabela de Alunos */}
        <div className="lg:col-span-2 glass rounded-2xl border border-slate-900/60 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-900/60 flex items-center justify-between">
            <h3 className="font-bold text-slate-200">Orientandos Cadastrados</h3>
            <span className="text-xs font-medium px-2.5 py-1 bg-slate-800 text-slate-400 rounded-full">
              {alunos.length} Aluno(s)
            </span>
          </div>

          {alunos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-3">
              <ShieldAlert className="h-10 w-10 text-slate-600" />
              <p className="text-sm text-slate-400 font-medium">Nenhum aluno cadastrado ainda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-900/60 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-900/10">
                    <th className="px-6 py-4">Nome / E-mail</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Data Cadastro</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/40 text-sm">
                  {alunos.map((aluno) => (
                    <tr key={aluno.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-200">{aluno.nome}</div>
                        <div className="text-xs text-slate-500">{aluno.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        {aluno.ativo ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <CheckCircle className="h-3 w-3" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400">
                            <XCircle className="h-3 w-3" />
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(aluno.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Botão de Toggle Autorização */}
                          <form action={alternarStatus.bind(null, aluno.id, aluno.ativo)}>
                            <button
                              type="submit"
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                aluno.ativo
                                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                                  : 'bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border-indigo-500/20'
                              }`}
                            >
                              {aluno.ativo ? 'Bloquear' : 'Autorizar'}
                            </button>
                          </form>

                          {/* Botão de Editar Cadastro */}
                          <details className="relative inline-block text-left group">
                            <summary className="list-none cursor-pointer p-1.5 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 rounded-lg transition-all select-none outline-none">
                              <Edit3 className="h-4 w-4" />
                            </summary>
                            <div className="absolute right-0 mt-2 p-4 bg-slate-950 border border-slate-900 rounded-xl shadow-2xl z-50 w-72 text-left space-y-4 animate-in fade-in duration-150">
                              <div className="text-xs font-bold text-slate-300 border-b border-slate-900 pb-2">
                                Editar Cadastro
                              </div>
                              <form action={editarAluno} className="space-y-3">
                                <input type="hidden" name="id" value={aluno.id} />
                                
                                <div className="space-y-1">
                                  <label className="text-[10px] font-semibold text-slate-400">Nome</label>
                                  <input
                                    type="text"
                                    name="nome"
                                    defaultValue={aluno.nome}
                                    required
                                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-850 rounded-lg text-slate-200 text-xs outline-none"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[10px] font-semibold text-slate-400">E-mail</label>
                                  <input
                                    type="email"
                                    name="email"
                                    defaultValue={aluno.email}
                                    required
                                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-850 rounded-lg text-slate-200 text-xs outline-none"
                                  />
                                </div>

                                <div className="pt-1">
                                  <button
                                    type="submit"
                                    className="w-full py-1.5 px-3 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold text-xs rounded-lg transition-all"
                                  >
                                    Salvar
                                  </button>
                                </div>
                              </form>
                            </div>
                          </details>

                          {/* Botão de Excluir */}
                          <form action={removerAluno.bind(null, aluno.id)}>
                            <button
                              type="submit"
                              className="p-1.5 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 border border-transparent hover:border-red-500/20 rounded-lg transition-all cursor-pointer"
                              title="Remover aluno"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </form>
                        </div>
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
