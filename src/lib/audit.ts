import { prisma } from './db';

export async function registrarLogAuditoria({
  usuarioId,
  acao,
  recurso,
  detalhes,
  ipAddress
}: {
  usuarioId: string | null;
  acao: string;
  recurso: string;
  detalhes?: string;
  ipAddress?: string;
}) {
  try {
    await prisma.auditoriaLog.create({
      data: {
        usuarioId,
        acao,
        recurso,
        detalhes: detalhes || null,
        ipAddress: ipAddress || null
      }
    });
  } catch (error) {
    // Falha silenciosa no log de auditoria para não quebrar a aplicação do usuário,
    // mas loga no console do servidor.
    console.error('Falha crítica ao gravar log de auditoria:', error);
  }
}
