import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// Script de seed (Módulo 1): cria o primeiro usuário Administrador, já
// aprovado, para permitir o primeiro login no portal. Rode com:
//   npx prisma db seed
//
// Personalize com variáveis de ambiente, se quiser:
//   SEED_ADMIN_EMAIL, SEED_ADMIN_NOME

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "mario@fullydigital.com.br";
  const nomeCompleto = process.env.SEED_ADMIN_NOME ?? "Mario";

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    console.log(
      `Usuário ${email} já existe (perfil: ${existente.perfil}). Nada a fazer.`
    );
    return;
  }

  const admin = await prisma.usuario.create({
    data: {
      nomeCompleto,
      email,
      perfil: "administrador",
      origemCadastro: "cadastro_tpo",
      statusCadastro: "aprovado",
      dataAprovacao: new Date(),
    },
  });

  console.log(`Administrador criado: ${admin.email} (id: ${admin.id})`);
  console.log("Acesse /login com esse e-mail para testar o Módulo 1.");
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
