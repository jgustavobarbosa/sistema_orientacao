import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PapelUsuario } from '@prisma/client';
import { Shield, Search, UserPlus, Filter } from 'lucide-react';
import Link from 'next/link';
import { alternarStatusAdmin, resetarSenhaAdmin, editarUsuarioAdmin, impersonateUser } from './actions';

export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; papel?: string; page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.papel !== PapelUsuario.ADMIN) redirect('/login');

  const params = await searchParams;
  const query = params.q?.toLowerCase() || '';
  const filtroPapel = params.papel || '';
  const page = parseInt(params.page || '1', 10);
  const pageSize = 50;

  const where: any = {};
  if (query) {
    where.OR = [
      { nome: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
    ];
  }
  if (filtroPapel === 'orientador') where.papel = PapelUsuario.ORIENTADOR;
  else if (filtroPapel === 'orientando') where.papel = PapelUsuario.ORIENTANDO;
  else if (filtroPapel === 'admin') where.papel = PapelUsuario.ADMIN;

  const [total, usuarios] = await Promise.all([
    prisma.usuario.count({ where }),
    prisma.usuario.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: pageSize,
      skip: (page - 1) * pageSize,
      include: {
        projetosOrientador: { select: { id: true, titulo: true, status: true } },
        projetosOrientando: { select: { id: true, titulo: true, status: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Shield className="h-8 w-8 text-indigo-400" />
            Gestão de Usuários
          </h1>
          <p className="text-slate-400 mt-1">{total} usuário(s) cadastrado(s)</p>
        </div>
        <Link
          href="/admin/usuarios/novo"
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          Novo Usuário
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <form className="flex-1 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Buscar por nome ou e-mail..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none focus:border-indigo-500/50"
            />
          </div>
          <select
            name="papel"
            defaultValue={filtroPapel}
            className="px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-300 outline-none focus:border-indigo-500/50"
          >
            <option value="">Todos os papéis</option>
            <option value="orientador">Orientadores</option>
            <option value="orientando">Orientandos</option>
            <option value="admin">Administradores</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-all cursor-pointer"
          >
            <Filter className="h-4 w-4 inline mr-1" />
            Filtrar
          </button>
        </form>
      </div>

      {/* Tabela */}
      <div className="glass rounded-2xl border border-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-900/60 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-900/10">
                <th className="px-6 py-4">Nome / E-mail</th>
                <th className="px-6 py-4">Papel</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Projetos</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/40">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-200">{u.nome}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      u.papel === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      u.papel === 'ORIENTADOR' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {u.papel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {u.categoria || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.ativo ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                    {!u.emailConfirmado && (
                      <span className="ml-1 text-xs text-amber-500">(email pendente)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {u.projetosOrientador.length > 0 && <div>Orientador: {u.projetosOrientador.length}</div>}
                    {u.projetosOrientando.length > 0 && <div>Orientando: {u.projetosOrientando.length}</div>}
                    {u.projetosOrientador.length === 0 && u.projetosOrientando.length === 0 && <span className="text-slate-600">Nenhum</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/usuarios/${u.id}`}
                        className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all cursor-pointer"
                      >
                        Editar
                      </Link>
                      <form action={alternarStatusAdmin.bind(null, u.id, u.ativo)}>
                        <button className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          u.ativo
                            ? 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                            : 'bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border-indigo-500/20'
                        }`}>
                          {u.ativo ? 'Bloquear' : 'Ativar'}
                        </button>
                      </form>
                      <form action={impersonateUser.bind(null, u.id)}>
                        <button className="px-3 py-1.5 text-xs font-bold bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/20 rounded-lg transition-all cursor-pointer">
                          Entrar como
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}