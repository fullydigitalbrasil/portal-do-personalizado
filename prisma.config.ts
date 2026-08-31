import "dotenv/config";
import { defineConfig, env } from "prisma/config";

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
});