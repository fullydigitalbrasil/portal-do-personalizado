import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// Script de seed: cria o primeiro usuário Administrador, já aprovado, para
// permitir o primeiro login no portal (Módulo 1), e a lista fixa de Nichos
// do estabelecimento usada no autocadastro público (Módulo 3). Rode com:
//   npx prisma db seed
//
// Personalize com variáveis de ambiente, se quiser:
//   SEED_ADMIN_EMAIL, SEED_ADMIN_NOME

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

// PRD v2.1, seção 5.1 — opções fixas do campo "Nicho do estabelecimento".
const NICHOS = [
  "Oriental",
  "Pizzaria",
  "Hamburgueria",
  "Confeitaria",
  "Salgados",
  "Esfiha",
  "Refeições",
  "Pastelaria",
  "Marmitas",
  "Padaria",
  "Carnes",
];

async function seedAdmin() {
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

async function seedNichos() {
  for (const nome of NICHOS) {
    await prisma.nicho.upsert({
      where: { nome },
      create: { nome },
      update: {},
    });
  }
  console.log(`Nichos verificados/criados: ${NICHOS.length}.`);
}

async function main() {
  await seedAdmin();
  await seedNichos();
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
