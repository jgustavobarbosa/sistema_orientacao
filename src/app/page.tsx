import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { PapelUsuario } from '@prisma/client';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (
    session.user.papel === PapelUsuario.ORIENTADOR ||
    session.user.papel === PapelUsuario.ADMIN
  ) {
    redirect('/orientador');
  }

  redirect('/aluno');
}
