'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { serverLog } from '@/lib/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PapelUsuario } from '@prisma/client';

export async function toggleLogResolvido(logId: string, resolvido: boolean) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.papel !== PapelUsuario.ADMIN) return;

  await prisma.sistemaLog.update({
    where: { id: logId },
    data: { resolvido: !resolvido },
  });

  serverLog('ADMIN_ACTION', 'INFO', `Log ${logId} marcado como ${resolvido ? 'pendente' : 'resolvido'}`, {}, session.user.id);
  revalidatePath('/admin/logs');
}

export async function limparLogsResolvidos() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.papel !== PapelUsuario.ADMIN) return;

  const result = await prisma.sistemaLog.deleteMany({
    where: { resolvido: true },
  });

  serverLog('ADMIN_ACTION', 'INFO', `${result.count} logs resolvidos foram removidos`, {}, session.user.id);
  revalidatePath('/admin/logs');
}