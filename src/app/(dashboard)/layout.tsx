import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AppSidebar } from '@/components/app-sidebar';
import { UserProfileMenu } from '@/components/user-profile-menu';
import { prisma } from '@/lib/db';
import { NotificationBell } from '@/components/notification-bell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Buscar últimas 20 notificações
  const notificacoes = await prisma.notificacao.findMany({
    where: { usuarioId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  return (
    <div className="flex min-h-screen bg-transparent text-slate-50">
      {/* Sidebar Lateral */}
      <AppSidebar session={session} />

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-slate-900/60 bg-slate-950/20 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full">
              {session.user.papel}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationBell notificacoesIniciais={notificacoes} />
            <UserProfileMenu session={session} />
          </div>
        </header>

        <div className="flex-1 p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          {children}
        </div>
      </main>
    </div>
  );
}
