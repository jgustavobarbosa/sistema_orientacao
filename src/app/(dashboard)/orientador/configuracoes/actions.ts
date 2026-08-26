'use server';

import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function salvarGoogleDriveEmail(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.papel !== 'ORIENTADOR') {
    redirect('/login');
  }

  const emailDrive = formData.get('emailDrive') as string;

  await prisma.usuario.update({
    where: { id: session.user.id },
    data: { googleDriveEmail: emailDrive?.trim() || null },
  });

  revalidatePath('/orientador/configuracoes');
}