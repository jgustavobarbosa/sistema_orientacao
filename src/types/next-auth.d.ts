import { DefaultSession } from 'next-auth';
import { PapelUsuario } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      papel: PapelUsuario;
      ativo: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    papel: PapelUsuario;
    ativo: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    papel: PapelUsuario;
    ativo: boolean;
  }
}
