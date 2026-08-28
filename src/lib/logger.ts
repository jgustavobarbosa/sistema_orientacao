/**
 * Logger do sistema SOIA — registra eventos no banco de dados.
 *
 * Uso:
 *   import { serverLog } from '@/lib/logger';
 *   await serverLog('LOGIN', 'INFO', 'Usuário autenticado', { email: 'x@y.com' });
 *
 * Tipos padrao (tipo):
 *   LOGIN, LOGOUT, CRIAR_USUARIO, EDITAR_USUARIO, EXCLUIR_USUARIO,
 *   CRIAR_PROJETO, EDITAR_PROJETO, EXCLUIR_PROJETO,
 *   ALTERAR_SENHA, RESET_SENHA, ADMIN_ACTION, ERRO, SISTEMA
 *
 * Severidade:
 *   INFO, AVISO, ERRO, CRITICO
 */

import { prisma } from './db';

export type LogTipo =
  | 'LOGIN' | 'LOGOUT'
  | 'CRIAR_USUARIO' | 'EDITAR_USUARIO' | 'EXCLUIR_USUARIO'
  | 'CRIAR_PROJETO' | 'EDITAR_PROJETO' | 'EXCLUIR_PROJETO'
  | 'ALTERAR_SENHA' | 'RESET_SENHA'
  | 'ADMIN_ACTION'
  | 'ERRO'
  | 'SISTEMA';

export type LogSeveridade = 'INFO' | 'AVISO' | 'ERRO' | 'CRITICO';

export interface LogMetadata {
  [key: string]: unknown;
  email?: string;
  usuarioId?: string;
  projetoId?: string;
  acao?: string;
  recurso?: string;
  erro?: string;
  ip?: string;
}

/**
 * Registra um evento no SistemaLog.
 * Funcao async — usar com await ou fire-and-forget (sem await em casos nao-criticos).
 */
export async function serverLog(
  tipo: LogTipo,
  severidade: LogSeveridade,
  mensagem: string,
  metadata?: LogMetadata,
  usuarioId?: string,
  ip?: string,
): Promise<void> {
  try {
    await prisma.sistemaLog.create({
      data: {
        tipo,
        severidade,
        mensagem,
        usuarioId: usuarioId || metadata?.usuarioId as string | undefined || null,
        metadata: (metadata || {}) as object,
        ip: ip || metadata?.ip || null,
      },
    });
  } catch (error) {
    // Log silencioso em stderr — nunca quebrar a operacao principal por causa do log
    console.error('[serverLog] Falha ao registrar log:', error instanceof Error ? error.message : error);
  }
}

/**
 * Versao sincrona para contexts onde async nao e viavel (middleware, callbacks).
 * Dispara e esquece.
 */
export function serverLogSync(
  tipo: LogTipo,
  severidade: LogSeveridade,
  mensagem: string,
  metadata?: LogMetadata,
  usuarioId?: string,
  ip?: string,
): void {
  serverLog(tipo, severidade, mensagem, metadata, usuarioId, ip).catch(() => {});
}