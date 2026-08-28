import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PapelUsuario } from '@prisma/client';
import { ArrowLeft, Shield } from 'lucide-react';
import { editarUsuarioAdmin, resetarSenhaAdmin } from '../actions';

export default async function AdminEditarUsuarioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.papel !== PapelUsuario.ADMIN) redirect('/login');

  const { id } = await params;
  const { error } = await searchParams;

  const user = await prisma.usuario.findUnique({
    where: { id },
    include: {
      projetosOrientador: { select: { id: true, titulo: true, status: true } },
      projetosOrientando: { select: { id: true, titulo: true, status: true } },
    },
  });

  if (!user) return <div className="text-slate-400 py-12 text-center">Usuário não encontrado.</div>;

  const errorMsg: Record<string, string> = {
    CamposObrigatorios: 'Todos os campos obrigatórios devem ser preenchidos.',
    EmailInvalido: 'Formato de e-mail inválido.',
    EmailDuplicado: 'Este e-mail já está em uso.',
    PapelInvalido: 'Papel selecionado é inválido.',
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/usuarios"
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-3">
            <Shield className="h-6 w-6 text-indigo-400" />
            Editar Usuário
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">{user.email}</p>
        </div>
      </div>

      {error && errorMsg[error] && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm">
          {errorMsg[error]}
        </div>
      )}

      <div className="glass rounded-2xl border border-slate-900/60 p-6">
        <form action={editarUsuarioAdmin} className="space-y-5">
          <input type="hidden" name="id" value={user.id} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Nome completo</label>
              <input
                type="text" name="nome" required
                defaultValue={user.nome}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none focus:border-indigo-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">E-mail</label>
              <input
                type="email" name="email" required
                defaultValue={user.email}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Papel</label>
              <select
                name="papel"
                defaultValue={user.papel}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none focus:border-indigo-500/50"
              >
                <option value="ORIENTADOR">Orientador</option>
                <option value="ORIENTANDO">Orientando</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Categoria</label>
              <input
                type="text" name="categoria"
                defaultValue={user.categoria || ''}
                placeholder="Ex: Mestrado, IC, Doutorado"
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none focus:border-indigo-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Status</label>
              <select
                name="ativo"
                defaultValue={user.ativo ? 'true' : 'false'}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none focus:border-indigo-500/50"
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer"
            >
              Salvar Alterações
            </button>
            <Link
              href="/admin/usuarios"
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition-all"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>

      {/* Projetos Vinculados */}
      <div className="glass rounded-2xl border border-slate-900/60 p-6">
        <h3 className="font-bold text-slate-200 mb-4">Projetos Vinculados</h3>
        {user.projetosOrientador.length === 0 && user.projetosOrientando.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum projeto vinculado.</p>
        ) : (
          <div className="space-y-2">
            {user.projetosOrientador.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 bg-slate-900/30 rounded-xl">
                <div>
                  <span className="text-xs font-medium text-blue-400 mr-2">[Orientador]</span>
                  <span className="text-sm text-slate-200">{p.titulo}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">{p.status}</span>
              </div>
            ))}
            {user.projetosOrientando.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 bg-slate-900/30 rounded-xl">
                <div>
                  <span className="text-xs font-medium text-emerald-400 mr-2">[Orientando]</span>
                  <span className="text-sm text-slate-200">{p.titulo}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">{p.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ações de Segurança */}
      <div className="glass rounded-2xl border border-slate-900/60 p-6">
        <h3 className="font-bold text-slate-200 mb-2">Ações de Segurança</h3>
        <p className="text-xs text-slate-500 mb-4">Envia um e-mail para o usuário com link para redefinir a senha.</p>
        <form action={resetarSenhaAdmin.bind(null, user.id)}>
          <button
            type="submit"
            className="px-4 py-2 bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 border border-amber-500/20 font-semibold text-xs rounded-xl transition-all cursor-pointer"
          >
            Resetar Senha (Enviar E-mail)
          </button>
        </form>
      </div>
    </div>
  );
}