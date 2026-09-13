import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PapelUsuario } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Não autorizado', { status: 401 });
  }

  const { id } = await params;

  const documento = await prisma.documento.findUnique({
    where: { id },
    include: {
      projeto: {
        select: {
          orientandoId: true,
          orientadorId: true,
        },
      },
    },
  });

  if (!documento) {
    return new NextResponse('Documento não encontrado', { status: 404 });
  }

  const papel = session.user.papel as PapelUsuario;
  const userId = session.user.id;
  const autorizado =
    papel === PapelUsuario.ADMIN ||
    documento.projeto.orientandoId === userId ||
    documento.projeto.orientadorId === userId;

  if (!autorizado) {
    return new NextResponse('Acesso negado', { status: 403 });
  }

  if (!documento.storagePath) {
    return new NextResponse(
      'Arquivo binário indisponível. Este documento foi enviado antes da persistência local de arquivos.',
      { status: 410 }
    );
  }

  const absolutePath = path.join(process.cwd(), 'uploads', 'documentos', documento.storagePath);

  try {
    const data = await fs.readFile(absolutePath);
    const filename = documento.nomeArquivoOriginal || path.basename(documento.storagePath);
    const headers = new Headers();
    headers.set('Content-Type', documento.mimeType || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${filename.replace(/"/g, '')}"`);
    headers.set('Content-Length', String(data.byteLength));
    return new NextResponse(data, { status: 200, headers });
  } catch {
    return new NextResponse('Arquivo não encontrado no armazenamento local.', { status: 404 });
  }
}
