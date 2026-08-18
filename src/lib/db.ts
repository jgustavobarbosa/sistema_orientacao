import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prisma: PrismaClient;

// Função inteligente para extrair a string de conexão nativa do Postgres
function obterUrlConexaoDireta(url: string): string {
  if (url.startsWith('prisma+postgres://')) {
    try {
      const urlObj = new URL(url);
      const apiKey = urlObj.searchParams.get('api_key');
      if (apiKey) {
        // Decodificar o payload Base64 do token
        const decoded = Buffer.from(apiKey, 'base64').toString('utf-8');
        const config = JSON.parse(decoded);
        if (config.databaseUrl) {
          console.log(`[SOAI DB] Conexão Prisma Postgres detectada. Decodificando banco local: ${config.databaseUrl.split('@')[1] || 'localhost'}`);
          return config.databaseUrl;
        }
      }
    } catch (e) {
      console.error('[SOAI DB] Falha ao decodificar api_key do Prisma Postgres:', e);
    }
  }
  return url;
}

if (typeof window === 'undefined') {
  if (!globalForPrisma.prisma) {
    const rawConnectionString = process.env.DATABASE_URL;
    if (!rawConnectionString) {
      throw new Error('DATABASE_URL is not set. Please check your environment variables.');
    }

    // Obter a URL real do Postgres (nativa) a ser passada para a biblioteca 'pg'
    const connectionString = obterUrlConexaoDireta(rawConnectionString);

    // Inicializar o driver adapter tradicional do Postgres exigido pelo Prisma 7
    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  prisma = globalForPrisma.prisma;
} else {
  prisma = null as unknown as PrismaClient;
}

export { prisma };
export * from '@prisma/client';
