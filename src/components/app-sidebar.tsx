'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Session } from 'next-auth';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Calendar, 
  LogOut, 
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { PapelUsuario } from '@prisma/client';

export function AppSidebar({ session }: { session: Session }) {
  const pathname = usePathname();
  const papel = session.user.papel as PapelUsuario;

  const menuItems = papel === PapelUsuario.ORIENTADOR 
    ? [
        { name: 'Dashboard', href: '/orientador', icon: LayoutDashboard },
        { name: 'Meus Alunos', href: '/orientador/alunos', icon: Users },
        { name: 'Minha Agenda', href: '/orientador/agenda', icon: Calendar },
        { name: 'Histórico de Atas', href: '/orientador/reunioes', icon: FileText },
      ]
    : [
        { name: 'Meu Espaço', href: '/aluno', icon: LayoutDashboard },
        { name: 'Minhas Reuniões', href: '/aluno/reunioes', icon: Calendar },
        { name: 'Redação de Capítulos', href: '/aluno/redacao', icon: BookOpen },
        { name: 'Minha Biblioteca', href: '/aluno/biblioteca', icon: BookOpen },
        { name: 'Meus Documentos', href: '/aluno/documentos', icon: FileText },
      ];

  return (
    <aside className="w-64 border-r border-slate-900/60 bg-slate-950/60 backdrop-blur-md flex flex-col z-50">
      {/* Brand Logo */}
      <div className="h-16 px-6 border-b border-slate-900/60 flex items-center gap-3">
        <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
          <GraduationCap className="h-5 w-5" />
        </div>
        <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
          SOIA
        </span>
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/10 border border-indigo-500/20 text-indigo-200 shadow-lg shadow-indigo-500/5'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Perfil e Ações do Rodapé */}
      <div className="p-4 border-t border-slate-900/60 space-y-3">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="h-5 w-5 text-red-500/70" />
          <span>Sair da Conta</span>
        </button>
      </div>
    </aside>
  );
}
