'use server';

import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { serverLog } from '@/lib/logger';
import { PapelUsuario } from '@prisma/client';

async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.papel !== PapelUsuario.ORIENTADOR && session.user.papel !== PapelUsuario.ADMIN)) {
    redirect('/login');
  }
  return session;
}

export async function salvarGoogleDriveEmail(formData: FormData) {
  const session = await checkAuth();
  const emailDrive = formData.get('emailDrive') as string;

  await prisma.usuario.update({
    where: { id: session.user.id },
    data: { googleDriveEmail: emailDrive?.trim() || null },
  });

  await serverLog('EDITAR_USUARIO', 'INFO', 'Link do Google Drive atualizado', {}, session.user.id);
  revalidatePath('/orientador/configuracoes');
}

export async function salvarMeetFixo(formData: FormData) {
  const session = await checkAuth();
  const linkMeet = formData.get('linkMeet') as string;

  await prisma.usuario.update({
    where: { id: session.user.id },
    data: { linkMeetFixo: linkMeet?.trim() || null },
  });

  await serverLog('EDITAR_USUARIO', 'INFO', 'Link do Meet fixo atualizado', {}, session.user.id);
  revalidatePath('/orientador/configuracoes');
}

export async function salvarConfigAgenda(formData: FormData) {
  const session = await checkAuth();
  const frequencia = formData.get('frequencia') as string;
  const diaSemana = parseInt(formData.get('diaSemana') as string, 10);
  const hora = formData.get('hora') as string;

  // Upsert: se ja existe, atualiza; se nao, cria
  const existing = await prisma.configAgendaAutomatica.findFirst({
    where: { orientadorId: session.user.id },
  });

  if (existing) {
    await prisma.configAgendaAutomatica.update({
      where: { id: existing.id },
      data: { frequencia, diaSemana, hora, ativo: true },
    });
  } else {
    await prisma.configAgendaAutomatica.create({
      data: { orientadorId: session.user.id, frequencia, diaSemana, hora, ativo: true },
    });
  }

  await serverLog('EDITAR_USUARIO', 'INFO', `Agenda configurada: ${frequencia} dia ${diaSemana} ${hora}`, {}, session.user.id);
  revalidatePath('/orientador/configuracoes');
}

export async function alternarAgenda(agendaId: string, ativo: boolean) {
  const session = await checkAuth();
  await prisma.configAgendaAutomatica.update({
    where: { id: agendaId },
    data: { ativo: !ativo },
  });

  await serverLog('EDITAR_USUARIO', 'INFO', `Agenda ${ativo ? 'pausada' : 'reativada'}`, {}, session.user.id);
  revalidatePath('/orientador/configuracoes');
}