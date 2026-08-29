'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { serverLog } from '@/lib/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  const { PapelUsuario } = await import('@prisma/client');
  if (!session || session.user.papel !== PapelUsuario.ADMIN) {
    throw new Error('Acesso negado');
  }
  return session;
}

export async function alternarStatusAdmin(id: string, statusAtual: boolean) {
  const session = await checkAdmin();
  try {
    await prisma.usuario.update({
      where: { id },
      data: { ativo: !statusAtual },
    });
    await serverLog('EDITAR_USUARIO', statusAtual ? 'AVISO' : 'INFO',
      `Usuário ${statusAtual ? 'bloqueado' : 'ativado'}`, { usuarioId: id }, session.user.id);
  } catch (e: any) {
    await serverLog('ERRO', 'ERRO', `Falha ao alternar status: ${e.message}`);
  }
  revalidatePath('/admin/usuarios');
}

export async function alterarPapelAdmin(id: string, novoPapel: string) {
  const session = await checkAdmin();
  const { PapelUsuario } = await import('@prisma/client');
  if (!Object.values(PapelUsuario).includes(novoPapel as any)) {
    return redirect('/admin/usuarios?error=PapelInvalido');
  }
  try {
    await prisma.usuario.update({
      where: { id },
      data: { papel: novoPapel as any },
    });
    await serverLog('EDITAR_USUARIO', 'INFO', `Papel alterado para ${novoPapel}`, { usuarioId: id }, session.user.id);
  } catch (e: any) {
    await serverLog('ERRO', 'ERRO', `Falha ao alterar papel: ${e.message}`);
  }
  revalidatePath('/admin/usuarios');
}

export async function resetarSenhaAdmin(id: string) {
  const session = await checkAdmin();
  const crypto = await import('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);

  try {
    await prisma.usuario.update({
      where: { id },
      data: { resetToken, resetTokenExp },
    });
    const user = await prisma.usuario.findUnique({ where: { id }, select: { email: true, nome: true } });
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    const { enviarEmail } = await import('@/lib/email');
    await enviarEmail(user!.email, 'SOIA: Redefinição de Senha', `<p>Um administrador solicitou a redefinição da sua senha.</p><p><a href="${resetLink}">Clique aqui</a> (expira em 24h)</p>`);
    await serverLog('RESET_SENHA', 'INFO', `Reset de senha para ${user!.email}`, { usuarioId: id }, session.user.id);
  } catch (e: any) {
    await serverLog('ERRO', 'ERRO', `Falha ao resetar senha: ${e.message}`);
  }
  revalidatePath('/admin/usuarios');
}

export async function criarUsuarioAdmin(formData: FormData) {
  const session = await checkAdmin();
  const nome = formData.get('nome') as string;
  const email = (formData.get('email') as string)?.toLowerCase().trim();
  const papel = formData.get('papel') as string;
  const categoria = formData.get('categoria') as string;
  const ativo = formData.get('ativo') === 'true';

  if (!nome || !email || !papel) {
    return redirect('/admin/usuarios/novo?error=CamposObrigatorios');
  }

  const { PapelUsuario } = await import('@prisma/client');
  if (!Object.values(PapelUsuario).includes(papel as any)) {
    return redirect('/admin/usuarios/novo?error=PapelInvalido');
  }

  try {
    const existente = await prisma.usuario.findUnique({ where: { email } });
    if (existente) return redirect('/admin/usuarios/novo?error=EmailDuplicado');

    const crypto = await import('crypto');
    const confirmToken = crypto.randomBytes(32).toString('hex');
    const confirmTokenExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.usuario.create({
      data: {
        nome,
        email,
        papel: papel as any,
        categoria: categoria || null,
        ativo,
        emailConfirmado: false,
        confirmToken,
        confirmTokenExp,
      },
    });

    const { enviarEmail } = await import('@/lib/email');
    const link = `${process.env.NEXTAUTH_URL}/completar-cadastro?token=${confirmToken}`;
    await enviarEmail(email, 'SOIA: Você foi cadastrado!', `<p>Olá ${nome},</p><p>Você foi cadastrado no SOIA como ${papel}.</p><p><a href="${link}">Clique aqui para criar sua senha</a></p>`);

    await serverLog('CRIAR_USUARIO', 'INFO', `Usuário criado: ${email} (${papel})`, { usuarioId: session.user.id });
  } catch (e: any) {
    await serverLog('ERRO', 'ERRO', `Falha ao criar usuário: ${e.message}`);
    return redirect('/admin/usuarios/novo?error=ErroInterno');
  }
  redirect('/admin/usuarios');
}

export async function editarUsuarioAdmin(formData: FormData) {
  const session = await checkAdmin();
  const id = formData.get('id') as string;
  const nome = formData.get('nome') as string;
  const email = (formData.get('email') as string)?.toLowerCase().trim();
  const papel = formData.get('papel') as string as any;
  const categoria = formData.get('categoria') as string;
  const ativo = formData.get('ativo') === 'true';

  try {
    await prisma.usuario.update({
      where: { id },
      data: { nome, email, papel, categoria: categoria || null, ativo },
    });
    await serverLog('EDITAR_USUARIO', 'INFO', `Usuário editado: ${email}`, { usuarioId: id }, session.user.id);
  } catch (e: any) {
    await serverLog('ERRO', 'ERRO', `Falha ao editar usuário: ${e.message}`);
  }
  revalidatePath('/admin/usuarios');
  redirect('/admin/usuarios');
}

export async function impersonateUser(targetUserId: string) {
  const session = await checkAdmin();
  const { prisma } = await import('@/lib/db');
  const target = await prisma.usuario.findUnique({ where: { id: targetUserId } });
  if (!target) return redirect('/admin/usuarios?error=UsuarioNaoEncontrado');

  // serverLog ANTES — fire-and-forget
  serverLog('ADMIN_ACTION', 'AVISO',
    `Admin impersonou ${target.email} (${target.nome})`,
    { targetUserId, targetEmail: target.email }, session.user.id).catch(() => {});

  // Gera um JWT para o usuario alvo e seta o cookie de sessao
  // Usa encode() do next-auth/jwt para criar o token exato que o NextAuth espera
  const { encode } = await import('next-auth/jwt');
  const { cookies } = await import('next/headers');
  const crypto = await import('crypto');

  const secret = process.env.NEXTAUTH_SECRET!;
  const agora = Math.floor(Date.now() / 1000);
  const token = {
    name: target.nome,
    email: target.email,
    sub: target.id,
    id: target.id,
    papel: target.papel,
    ativo: target.ativo,
    emailConfirmado: target.emailConfirmado,
    iat: agora,
    exp: agora + 30 * 24 * 60 * 60, // 30 dias
    jti: crypto.randomBytes(16).toString('hex'),
  };

  const sessionToken = await encode({ token, secret });

  // Seta o cookie de sessao do NextAuth
  // HTTPS usa __Secure- prefix
  (await cookies()).set('__Secure-next-auth.session-token', sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });
  // Fallback para HTTP
  (await cookies()).set('next-auth.session-token', sessionToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });

  // Redirect para o dashboard do usuario alvo
  const redirectMap: Record<string, string> = {
    ADMIN: '/admin', ORIENTADOR: '/orientador', ORIENTANDO: '/aluno',
  };
  redirect(redirectMap[target.papel] || '/');
}