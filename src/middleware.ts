import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { PapelUsuario } from '@prisma/client';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Se o usuário não está autenticado, o withAuth redirecionará para login automaticamente
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const papel = token.papel as PapelUsuario;
    const ativo = token.ativo as boolean;

    // Se o usuário não está ativo (exceto o próprio orientador que é sempre ativo)
    if (!ativo && papel !== PapelUsuario.ORIENTADOR && papel !== PapelUsuario.ADMIN) {
      return NextResponse.redirect(new URL('/login?error=AguardandoAutorizacao', req.url));
    }

    // Controle de Acesso Baseado em Papéis (RBAC)
    if (path.startsWith('/admin') && papel !== PapelUsuario.ADMIN) {
      return NextResponse.redirect(new URL('/login?error=NaoAutorizado', req.url));
    }

    if (path.startsWith('/orientador') && papel !== PapelUsuario.ORIENTADOR && papel !== PapelUsuario.ADMIN) {
      // Aluno tentando acessar área de Orientador - Redireciona e nega
      return NextResponse.redirect(new URL('/aluno?error=AcessoNegado', req.url));
    }

    if (path.startsWith('/aluno') && papel === PapelUsuario.ORIENTADOR) {
      // O orientador pode opcionalmente visualizar a área de aluno se quiser, 
      // mas por padrão redireciona para seu painel centralizado se ele apenas bater em /aluno
      if (path === '/aluno') {
        return NextResponse.redirect(new URL('/orientador', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

// Proteger apenas as rotas de painel e APIs internas
export const config = {
  matcher: [
    '/admin/:path*',
    '/orientador/:path*',
    '/aluno/:path*',
    // APIs que precisam de proteção global (exclui auth e hooks externos)
    '/api/orientador/:path*',
    '/api/projetos/:path*',
    '/api/reunioes/:path*',
  ],
};
