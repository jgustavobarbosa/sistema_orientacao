import { prisma } from '@/lib/db';

export async function criarNotificacao(usuarioId: string, titulo: string, mensagem: string) {
  try {
    await prisma.notificacao.create({
      data: {
        usuarioId,
        titulo,
        mensagem
      }
    });
  } catch (e) {
    console.error('Erro ao criar notificação:', e);
  }
}
