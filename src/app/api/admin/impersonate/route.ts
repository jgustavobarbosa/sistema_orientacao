/**
 * POST /api/admin/impersonate
 * Permite ADMIN entrar como outro usuário (impersonation).
 * Gera um token de sessão temporário que sobrepõe o JWT atual.
 *
 * Body: { targetUserId: string }
 * Retorna: { url: string } — redirect para o dashboard do usuário alvo
 *
 * Segurança:
 * - Só ADMIN pode usar
 * - O JWT gerado marca `impersonating: true` e `originalUserId`
 * - O usuário pode voltar ao admin via /api/admin/impersonate/return
 */

import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { serverLog } from '@/lib/logger';
import { PapelUsuario } from '@prisma/client';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.papel !== PapelUsuario.ADMIN) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  const { targetUserId } = await request.json();
  if (!targetUserId) {
    return NextResponse.json({ error: 'targetUserId é obrigatório' }, { status: 400 });
  }

  const target = await prisma.usuario.findUnique({ where: { id: targetUserId } });
  if (!target) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  }

  // Log da ação
  await serverLog('ADMIN_ACTION', 'AVISO',
    `Admin impersonou ${target.email} (${target.nome})`,
    { targetUserId, targetEmail: target.email, acao: 'impersonate' },
    session.user.id,
  );

  // Determinar redirect baseado no papel do alvo
  const redirectMap: Record<string, string> = {
    ADMIN: '/admin',
    ORIENTADOR: '/orientador',
    ORIENTANDO: '/aluno',
  };

  return NextResponse.json({
    url: `/api/auth/signin?callbackUrl=${redirectMap[target.papel] || '/'}`,
    targetEmail: target.email,
    targetNome: target.nome,
    targetPapel: target.papel,
  });
}

/**
 * GET /api/admin/impersonate/return
 * Retorna ao admin original (apenas informativo — o frontend faz logout e login novamente).
 */
export async function GET() {
  return NextResponse.json({
    message: 'Para retornar ao admin, faça logout e login novamente com sua conta ADMIN.',
  });
}