import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './db';
import { PapelUsuario } from '@prisma/client';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret',
    }),
    CredentialsProvider({
      name: 'Desenvolvimento',
      credentials: {
        email: { label: 'E-mail de Teste', type: 'text', placeholder: 'orientador@teste.com' }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        
        const email = credentials.email.toLowerCase().trim();
        const nome = email.split('@')[0];
        const papel = (email.includes('orientador') || email === 'janioguga@gmail.com') ? PapelUsuario.ORIENTADOR : PapelUsuario.ORIENTANDO;

        // Criar ou obter usuário de teste no banco de dados local
        const user = await prisma.usuario.upsert({
          where: { email },
          update: { papel, ativo: true },
          create: {
            nome: nome.charAt(0).toUpperCase() + nome.slice(1),
            email,
            papel,
            ativo: true
          }
        });

        return {
          id: user.id,
          name: user.nome,
          email: user.email,
          image: null,
          papel: user.papel,
          ativo: user.ativo
        };
      }
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'credentials') {
        return true;
      }
      if (!user.email) return false;

      const email = user.email.toLowerCase();
      const orientadorEmail = process.env.ORIENTADOR_EMAIL?.toLowerCase();

      try {
        // 1. Verificar se é o Orientador (dono do sistema)
        if (orientadorEmail && email === orientadorEmail) {
          let dbUser = await prisma.usuario.findUnique({
            where: { email },
          });

          if (!dbUser) {
            // Criar o orientador se ele ainda não estiver no banco
            await prisma.usuario.create({
              data: {
                nome: user.name || 'Orientador',
                email,
                papel: PapelUsuario.ORIENTADOR,
                ativo: true,
                googleId: account?.providerAccountId,
                avatarUrl: user.image,
              },
            });
          } else if (dbUser.papel !== PapelUsuario.ORIENTADOR) {
            // Forçar o papel correto se por algum motivo estivesse diferente
            await prisma.usuario.update({
              where: { email },
              data: { papel: PapelUsuario.ORIENTADOR, ativo: true },
            });
          }
          return true;
        }

        // 2. Verificar se é um aluno cadastrado/convidado
        const dbUser = await prisma.usuario.findUnique({
          where: { email },
        });

        if (!dbUser) {
          // Aluno não cadastrado pelo orientador não pode entrar
          return '/login?error=NaoAutorizado';
        }

        // Se o aluno está cadastrado, atualizar dados do perfil no primeiro login
        if (!dbUser.googleId && account?.providerAccountId) {
          await prisma.usuario.update({
            where: { email },
            data: {
              googleId: account.providerAccountId,
              avatarUrl: dbUser.avatarUrl || user.image,
              nome: dbUser.nome || user.name || '',
            },
          });
        }

        // Se o aluno ainda não foi autorizado (ativo = false)
        if (!dbUser.ativo) {
          return '/login?error=AguardandoAutorizacao';
        }

        return true;
      } catch (error) {
        console.error('Erro no callback signIn:', error);
        return '/login?error=ErroInterno';
      }
    },
    async jwt({ token, account, user }) {
      // Executado na criação do token JWT
      if (user && user.email) {
        try {
          const dbUser = await prisma.usuario.findUnique({
            where: { email: user.email.toLowerCase() },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.papel = dbUser.papel;
            token.ativo = dbUser.ativo;
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário no JWT callback:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Expõe os dados do token para o cliente
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.papel = token.papel as PapelUsuario;
        session.user.ativo = token.ativo as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};
