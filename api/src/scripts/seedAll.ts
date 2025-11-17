import { prisma } from "../database/prisma";
import * as bcrypt from "bcryptjs";
import { Casa, Disciplina, Professor, Turma } from "@prisma/client";

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = "password123";

// --- DADOS INICIAIS ---

const casasData = [
  { nome: "Grifinória", diretor: "Minerva McGonagall", cor: "#7F0909" },
  { nome: "Sonserina", diretor: "Severus Snape", cor: "#1A472A" },
  { nome: "Lufa-Lufa", diretor: "Pomona Sprout", cor: "#FFD800" },
  { nome: "Corvinal", diretor: "Filius Flitwick", cor: "#0E1A40" },
];

const turmasData = [
  { serie: "1", turno: "MATUTINO" },
  { serie: "2", turno: "MATUTINO" },
  { serie: "3", turno: "VESPERTINO" },
  { serie: "4", turno: "VESPERTINO" },
];

const disciplinasData = [
  { nome: "Poções", cargaHoraria: 60, eObrigatoria: true },
  { nome: "Feitiços", cargaHoraria: 80, eObrigatoria: true },
  { nome: "Transfiguração", cargaHoraria: 80, eObrigatoria: true },
  { nome: "Adivinhação", cargaHoraria: 40, eObrigatoria: false },
  { nome: "Estudos dos Trouxas", cargaHoraria: 30, eObrigatoria: false },
  {
    nome: "Defesa Contra as Artes das Trevas",
    cargaHoraria: 70,
    eObrigatoria: true,
  },
];

const professoresData = [
  {
    nome: "Severus Snape",
    email: "snape@hogwarts.com",
    cpf: "11111111111",
    telefone: "11988887777",
  },
  {
    nome: "Minerva McGonagall",
    email: "mcgonagall@hogwarts.com",
    cpf: "22222222222",
    telefone: "11988886666",
  },
  {
    nome: "Filius Flitwick",
    email: "flitwick@hogwarts.com",
    cpf: "33333333333",
    telefone: "11988885555",
  },
  {
    nome: "Sibila Trelawney",
    email: "trelawney@hogwarts.com",
    cpf: "44444444444",
    telefone: "11988884444",
  },
];

const alunosData = [
  {
    nome: "Harry Potter",
    email: "harry.potter@hogwarts.com",
    cpf: "55555555555",
    telefone: "11977771111",
    dataNascimento: new Date("1980-07-31"),
  },
  {
    nome: "Hermione Granger",
    email: "hermione.granger@hogwarts.com",
    cpf: "66666666666",
    telefone: "11977772222",
    dataNascimento: new Date("1979-09-19"),
  },
  {
    nome: "Draco Malfoy",
    email: "draco.malfoy@hogwarts.com",
    cpf: "77777777777",
    telefone: "11977773333",
    dataNascimento: new Date("1980-06-05"),
  },
  {
    nome: "Luna Lovegood",
    email: "luna.lovegood@hogwarts.com",
    cpf: "88888888888",
    telefone: "11977774444",
    dataNascimento: new Date("1981-02-13"),
  },
  {
    nome: "Cedrico Diggory",
    email: "cedrico.diggory@hogwarts.com",
    cpf: "99999999999",
    telefone: "11977775555",
    dataNascimento: new Date("1977-09-15"),
  },
];

async function seedAll() {
  console.log("==============================================");
  console.log("🌱 Iniciando o Seed de Dados de Hogwarts...");
  console.log("==============================================");

  // --- 1. Hashing da Senha Padrão ---
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
  console.log(`\n🔑 Senha padrão (hogwarts123) hashada.`);

  // --- 2. Criar Casas (Chave Estrangeira Crucial) ---
  console.log("\n🏰 Criando Casas...");
  const casas: Casa[] = [];
  for (const casa of casasData) {
    const result = await prisma.casa.upsert({
      where: { nome: casa.nome },
      update: {},
      create: casa,
    });
    casas.push(result);
    console.log(`  ✅ Casa ${casa.nome}`);
  }
  const casaGrifinoriaId = casas.find((c) => c.nome === "Grifinória")?.id;
  const casaSonserinaId = casas.find((c) => c.nome === "Sonserina")?.id;
  const casaLufaLufaId = casas.find((c) => c.nome === "Lufa-Lufa")?.id;
  const casaCorvinalId = casas.find((c) => c.nome === "Corvinal")?.id;

  // --- 3. Criar Turmas (Chave Estrangeira Crucial) ---
  console.log("\n📚 Criando Turmas (Anos/Turnos)...");
  const turmas: Turma[] = [];
  for (const turma of turmasData) {
    const existing = await prisma.turma.findFirst({
      where: { serie: String(turma.serie), turno: turma.turno },
    });

    if (existing) {
      turmas.push(existing);
      console.log(
        `  ✅ Turma ${turma.serie}º Ano (${turma.turno}) (já existente)`
      );
    } else {
      const result = await prisma.turma.create({ data: turma });
      turmas.push(result);
      console.log(`  ✅ Turma ${turma.serie}º Ano (${turma.turno})`);
    }
  }
  const turma1AnoId = turmas.find((t) => Number(t.serie) === 1)?.id;
  const turma2AnoId = turmas.find((t) => Number(t.serie) === 2)?.id;
  const turma3AnoId = turmas.find((t) => Number(t.serie) === 3)?.id;

  // --- 4. Criar Disciplinas ---
  console.log("\n📜 Criando Disciplinas (Matérias)...");
  const disciplinas: Disciplina[] = [];
  for (const disciplina of disciplinasData) {
    const result = await prisma.disciplina.upsert({
      where: { nome: disciplina.nome },
      update: {},
      create: disciplina,
    });
    disciplinas.push(result);
    console.log(`  ✅ Disciplina ${disciplina.nome}`);
  }

  // --- 5. Criar Secretário (Admin) ---
  console.log("\n👤 Criando Secretário (Admin)...");
  const secretarioData = {
    nome: "Albus Dumbledore",
    email: "diretor@hogwarts.com",
    senha: hashedPassword,
    telefone: "99999999999",
  };
  await prisma.secretario.upsert({
    where: { email: secretarioData.email },
    update: {},
    create: secretarioData,
  });
  console.log(
    `  ✅ Secretário: ${secretarioData.email} (Senha: ${DEFAULT_PASSWORD})`
  );

  // --- 6. Criar Professores ---
  console.log("\n👨‍🏫 Criando Professores...");
  const professores: Professor[] = [];
  for (const prof of professoresData) {
    // Atribui uma disciplina principal ao professor (para exemplificar)
    let disciplinaPrincipalId: number | undefined;
    if (prof.nome.includes("Snape"))
      disciplinaPrincipalId = disciplinas.find((d) => d.nome === "Poções")?.id;
    else if (prof.nome.includes("McGonagall"))
      disciplinaPrincipalId = disciplinas.find(
        (d) => d.nome === "Transfiguração"
      )?.id;
    else if (prof.nome.includes("Flitwick"))
      disciplinaPrincipalId = disciplinas.find(
        (d) => d.nome === "Feitiços"
      )?.id;
    else if (prof.nome.includes("Trelawney"))
      disciplinaPrincipalId = disciplinas.find(
        (d) => d.nome === "Adivinhação"
      )?.id;

    const result = await prisma.professor.upsert({
      where: { email: prof.email },
      update: {},
      create: {
        ...prof,
        senha: hashedPassword,
        ...(disciplinaPrincipalId
          ? { disciplinaPrincipal: { connect: { id: disciplinaPrincipalId } } }
          : {}),
      },
    });
    professores.push(result);
    console.log(`  ✅ Professor ${prof.nome} (Senha: ${DEFAULT_PASSWORD})`);
  }

  // --- 7. Criar Alunos ---
  console.log("\n🧙‍♂️ Criando Alunos...");
  const alunos = [];
  for (let i = 0; i < alunosData.length; i++) {
    const aluno = alunosData[i];

    // Distribuição arbitrária
    let casaId: number | undefined;
    let turmaId: number | undefined;

    if (i % 5 === 0) {
      // Harry
      casaId = casaGrifinoriaId;
      turmaId = turma3AnoId;
    } else if (i % 5 === 1) {
      // Hermione
      casaId = casaGrifinoriaId;
      turmaId = turma3AnoId;
    } else if (i % 5 === 2) {
      // Draco
      casaId = casaSonserinaId;
      turmaId = turma3AnoId;
    } else if (i % 5 === 3) {
      // Luna
      casaId = casaCorvinalId;
      turmaId = turma1AnoId;
    } else {
      // Cedrico
      casaId = casaLufaLufaId;
      turmaId = turma2AnoId;
    }

    if (!casaId || !turmaId) {
      console.error(`  ❌ Erro ao atribuir IDs para ${aluno.nome}. Pulando.`);
      continue;
    }

    const result = await prisma.aluno.upsert({
      where: { email: aluno.email },
      update: {},
      create: {
        ...aluno,
        senha: hashedPassword,
        casaId: casaId,
        turmaId: turmaId,
      },
      include: {
        casa: true,
        turma: true,
      },
    });
    alunos.push(result);
    console.log(
      `  ✅ Aluno ${aluno.nome} (${result.casa?.nome ?? "N/A"} - ${
        result.turma?.serie ?? "N/A"
      }º Ano)`
    );
  }

  // --- 8. Criar Matrículas de Exemplo ---
  console.log("\n📝 Criando Matrículas de Exemplo...");
  const matriculasCount = await seedMatriculas(alunos, disciplinas);
  console.log(`  📊 Total de Matrículas criadas: ${matriculasCount}`);

  // --- 9. Resumo Final ---
  console.log("\n==============================================");
  console.log("🎉 SEED CONCLUÍDO COM SUCESSO!");
  console.log("==============================================");
  console.log(`- Usuários de Teste (Senha: ${DEFAULT_PASSWORD})`);
  console.log(`  - Secretário: ${secretarioData.email}`);
  console.log(`  - Professor: ${professoresData[0].email}`);
  console.log(`  - Aluno: ${alunosData[0].email}`);
  console.log("==============================================");
}

/**
 * Função auxiliar para criar matrículas
 */
async function seedMatriculas(
  alunos: any[],
  disciplinas: Disciplina[]
): Promise<number> {
  let count = 0;
  const disciplinaFeiticosId = disciplinas.find(
    (d) => d.nome === "Feitiços"
  )?.id;
  const disciplinaPocoesId = disciplinas.find((d) => d.nome === "Poções")?.id;

  if (!disciplinaFeiticosId || !disciplinaPocoesId) {
    console.log(
      "⚠️  Não foi possível encontrar IDs de disciplinas. Pulando matrículas."
    );
    return 0;
  }

  for (const aluno of alunos) {
    // Matricular todos os alunos em Feitiços
    await prisma.matricula.upsert({
      where: {
        alunoId_disciplinaId: {
          alunoId: aluno.id,
          disciplinaId: disciplinaFeiticosId,
        },
      },
      update: {},
      create: { alunoId: aluno.id, disciplinaId: disciplinaFeiticosId },
    });
    count++;

    // Matricular metade dos alunos em Poções
    if (aluno.nome.includes("Potter") || aluno.nome.includes("Malfoy")) {
      await prisma.matricula.upsert({
        where: {
          alunoId_disciplinaId: {
            alunoId: aluno.id,
            disciplinaId: disciplinaPocoesId,
          },
        },
        update: {},
        create: { alunoId: aluno.id, disciplinaId: disciplinaPocoesId },
      });
      count++;
    }
  }
  return count;
}

// Executa o seed
(async () => {
  try {
    await seedAll();
  } catch (error) {
    console.error("❌ Falha no seed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
