import dotenv from 'dotenv';

dotenv.config();

/**
 * Validação e centralização de variáveis de ambiente do módulo motoboys.
 * Aplica o padrão Fail-Fast se variáveis vitais estiverem ausentes em produção.
 */
export function validateEnv() {
  const isProduction = process.env.NODE_ENV === 'production';

  const requiredEnvs = ['DATABASE_URL'];
  const missingEnvs: string[] = [];

  for (const envName of requiredEnvs) {
    if (!process.env[envName]) {
      missingEnvs.push(envName);
    }
  }

  if (missingEnvs.length > 0) {
    throw new Error(
      `[FATAL] Variáveis de ambiente obrigatórias ausentes: ${missingEnvs.join(', ')}`
    );
  }

  if (isProduction && !process.env.ADMIN_TOKEN) {
    throw new Error(
      '[FATAL] ADMIN_TOKEN precisa ser definido em ambiente de produção para garantir a segurança das rotas administrativas.'
    );
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  DATABASE_URL: process.env.DATABASE_URL || '',
  REDIS_URL: process.env.REDIS_URL || 'redis://redis:6379',
  ADMIN_TOKEN: process.env.ADMIN_TOKEN || '',
  EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY || 'apitestkey',
  EVOLUTION_API_URL: process.env.EVOLUTION_API_URL || 'http://evolution:8080',
  PUBLIC_WEBHOOK_URL: process.env.PUBLIC_WEBHOOK_URL || 'http://motoboys:3000',
};
