import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

// `dotenv/config` sozinho só carrega um arquivo chamado ".env" — mas o
// `vercel env pull` salva as variáveis em ".env.local". Carregamos os dois
// aqui (o dotenv não sobrescreve uma variável que já foi definida, então
// ".env.local" tem prioridade e ".env" serve só de fallback local).
loadEnv({ path: ".env.local" });
loadEnv();

// Prisma 7: a URL de conexão não fica mais no schema.prisma — o CLI
// (migrate, studio etc.) lê a partir daqui. A conexão da aplicação em
// runtime é configurada separadamente em lib/db/client.ts, via adapter.
//
// DATABASE_URL_UNPOOLED = conexão direta do Neon, usada só pelo CLI
// (migrations). DATABASE_URL = conexão via pooler, usada pela aplicação.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL_UNPOOLED"),
  },
  migrations: {
    // Prisma 7: seed só roda explicitamente com `npx prisma db seed`
    // (não é mais automático em `migrate dev`/`migrate reset`).
    seed: "tsx prisma/seed.ts",
  },
});
