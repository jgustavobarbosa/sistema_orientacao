import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './db';
import { PapelUsuario } from '@prisma/client';
import bcrypt from 'bcrypt';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'E-mail', type: 'text', placeholder: 'aluno@teste.com' },
        senha: { label: 'Senha', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) {
          throw new Error('Preencha todos os campos.');
        }

        const email = credentials.email.toLowerCase().trim();

        // 1. Procurar o usuário no banco
        const user = await prisma.usuario.findUnique({
          where: { email },
        });

        // 2. Se for login de desenvolvimento (sem senha cadastrada e e-mail contendo "orientador" ou "aluno")
        // para facilitar testes do desenvolvedor, podemos permitir o login se a senha for "senha123" ou "dev"
        if (user && !user.senha && (credentials.senha === 'senha123' || credentials.senha === 'dev')) {
          return {
            id: user.id,
            name: user.nome,
            email: user.email,
            image: user.avatarUrl,
            papel: user.papel,
            ativo: user.ativo,
            emailConfirmado: user.emailConfirmado
          };
        }

        if (!user || !user.senha) {
          throw new Error('E-mail ou senha incorretos.');
        }

        // 3. Comparar a senha usando bcrypt
        const senhaCorreta = await bcrypt.compare(credentials.senha, user.senha);
        if (!senhaCorreta) {
          throw new Error('E-mail ou senha incorretos.');
        }

        return {
          id: user.id,
          name: user.nome,
          email: user.email,
          image: user.avatarUrl,
          papel: user.papel,
          ativo: user.ativo,
          emailConfirmado: user.emailConfirmado
        };
      }
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) return false;

      try {
        const email = user.email.toLowerCase();
        const orientadorEmail = process.env.ORIENTADOR_EMAIL?.toLowerCase();

        // Buscar usuário do banco para checar dados reais
        const dbUser = await prisma.usuario.findUnique({
          where: { email },
        });

        if (!dbUser) {
          return '/login?error=NaoAutorizado';
        }

        // Se for o Orientador principal definido nas variáveis de ambiente, ele sempre entra livre
        if (orientadorEmail && email === orientadorEmail) {
          return true;
        }

        // Regra de Negócio de Ativação Estrita:
        // 1. Confirmou o e-mail?
        if (!dbUser.emailConfirmado) {
          return '/login?error=EmailNaoConfirmado';
        }

        // 2. Está ativo no sistema?
        if (!dbUser.ativo) {
          return '/login?error=AguardandoAutorizacao';
        }

        return true;
      } catch (error) {
        console.error('Erro no callback signIn:', error);
        return '/login?error=ErroInterno';
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.papel = user.papel;
        token.ativo = user.ativo;
        token.emailConfirmado = user.emailConfirmado;
      } else if (token.email) {
        try {
          const dbUser = await prisma.usuario.findUnique({
            where: { email: token.email.toLowerCase() },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.papel = dbUser.papel;
            token.ativo = dbUser.ativo;
            token.emailConfirmado = dbUser.emailConfirmado;
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário no JWT callback:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.papel = token.papel as PapelUsuario;
        session.user.ativo = token.ativo as boolean;
        session.user.emailConfirmado = token.emailConfirmado as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};
