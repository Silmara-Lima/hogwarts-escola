import * as dotenv from "dotenv";
dotenv.config();

import { prisma } from "../database/prisma";
import * as bcrypt from "bcryptjs";
import { Casa, Disciplina, Turma, Professor, Aluno } from "@prisma/client";

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = "password123";

// =========================================================================
// 1. Dados Iniciais
// =========================================================================

const casasData = [
  { nome: "Grifinória", diretor: "Minerva McGonagall", cor: "Vinho" },
  { nome: "Sonserina", diretor: "Severus Snape", cor: "Verde" },
  { nome: "Lufa-Lufa", diretor: "Pomona Sprout", cor: "Amarelo" },
  { nome: "Corvinal", diretor: "Filius Flitwick", cor: "Azul escuro" },
];

const turmasData = [
  { serie: 1, turno: "MATUTINO" },
  { serie: 2, turno: "MATUTINO" },
  { serie: 3, turno: "VESPERTINO" },
  { serie: 4, turno: "VESPERTINO" },
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
    departamento: "Poções",
    matricula: "P001",
  },
  {
    nome: "Minerva McGonagall",
    email: "mcgonagall@hogwarts.com",
    cpf: "22222222222",
    telefone: "11988886666",
    departamento: "Transfiguração",
    matricula: "P002",
  },
  {
    nome: "Filius Flitwick",
    email: "flitwick@hogwarts.com",
    cpf: "33333333333",
    telefone: "11988885555",
    departamento: "Feitiços",
    matricula: "P003",
  },
  {
    nome: "Sibila Trelawney",
    email: "trelawney@hogwarts.com",
    cpf: "44444444444",
    telefone: "11988884444",
    departamento: "Adivinhação",
    matricula: "P004",
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

// =========================================================================
// 2. Seed Principal
// =========================================================================

async function seedAll() {
  console.log("==============================================");
  console.log("🌱 Iniciando o Seed de Dados de Hogwarts...");
  console.log("==============================================");

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  // =========================================================================
  // 2.1 Casas
  // =========================================================================
  console.log("\n🏰 Criando Casas...");
  const casas: Casa[] = [];
  for (const casa of casasData) {
    const result = await prisma.casa.upsert({
      where: { nome: casa.nome },
      update: {},
      create: casa,
    });
    casas.push(result);
  }
  const getCasaId = (nome: string) => casas.find((c) => c.nome === nome)?.id;

  // =========================================================================
  // 2.2 Turmas
  // =========================================================================
  console.log("\n📚 Criando Turmas...");
  const turmas: Turma[] = [];
  for (const turma of turmasData) {
    const serieString = String(turma.serie);
    const existing = await prisma.turma.findFirst({
      where: { serie: serieString, turno: turma.turno },
    });
    if (existing) turmas.push(existing);
    else
      turmas.push(
        await prisma.turma.create({
          data: { serie: serieString, turno: turma.turno },
        })
      );
  }
  const getTurmaId = (serie: number | string) =>
    turmas.find((t) => t.serie === String(serie))?.id;

  // =========================================================================
  // 2.3 Disciplinas
  // =========================================================================
  console.log("\n📜 Criando Disciplinas...");
  const disciplinas: Disciplina[] = [];
  for (const disciplina of disciplinasData) {
    const result = await prisma.disciplina.upsert({
      where: { nome: disciplina.nome },
      update: {},
      create: disciplina,
    });
    disciplinas.push(result);
  }
  const getDisciplinaId = (nome: string) =>
    disciplinas.find((d) => d.nome === nome)?.id;

  // =========================================================================
  // 2.4 Secretário
  // =========================================================================
  console.log("\n👤 Criando Secretário...");
  await prisma.secretario.upsert({
    where: { email: "diretor@hogwarts.com" },
    update: {},
    create: {
      nome: "Albus Dumbledore",
      email: "diretor@hogwarts.com",
      senha: hashedPassword,
    },
  });

  // =========================================================================
  // 2.5 Professores
  // =========================================================================
  console.log("\n👨‍🏫 Criando Professores...");
  const professoresCriados: Professor[] = [];
  for (const prof of professoresData) {
    const result = await prisma.professor.upsert({
      where: { email: prof.email },
      update: {
        senha: hashedPassword,
        nome: prof.nome,
        departamento: prof.departamento,
        telefone: prof.telefone,
        matricula: prof.matricula,
      },
      create: { ...prof, senha: hashedPassword, matricula: prof.matricula },
    });
    professoresCriados.push(result);
  }
  const getProfessorId = (nome: string) =>
    professoresCriados.find((p) => p.nome === nome)?.id;

  // =========================================================================
  // 2.6 Alunos
  // =========================================================================
  console.log("\n🧙‍♂️ Criando Alunos...");
  const alunosCriados: Aluno[] = [];
  for (let i = 0; i < alunosData.length; i++) {
    const aluno = alunosData[i];
    const casaId = getCasaId(
      i % 5 === 0 || i % 5 === 1
        ? "Grifinória"
        : i % 5 === 2
        ? "Sonserina"
        : i % 5 === 3
        ? "Corvinal"
        : "Lufa-Lufa"
    );
    const turmaId = getTurmaId(i % 5 === 3 ? 1 : i % 5 === 4 ? 2 : 3);
    if (!casaId || !turmaId) continue;
    const result = await prisma.aluno.upsert({
      where: { email: aluno.email },
      update: {},
      create: { ...aluno, senha: hashedPassword, casaId, turmaId },
    });
    alunosCriados.push(result);
  }

  // =========================================================================
  // 2.7 TurmaDisciplina
  // =========================================================================
  console.log("\n🔗 Atribuindo Professores a Disciplinas/Turmas...");
  const snapeId = getProfessorId("Severus Snape");
  const mcgonagallId = getProfessorId("Minerva McGonagall");
  const flitwickId = getProfessorId("Filius Flitwick");
  const pocoesId = getDisciplinaId("Poções");
  const transfiguracaoId = getDisciplinaId("Transfiguração");
  const feiticosId = getDisciplinaId("Feitiços");
  const turma1Id = getTurmaId(1);
  const turma3Id = getTurmaId(3);

  const atribuicoes = [
    { professorId: snapeId, disciplinaId: pocoesId, turmaId: turma3Id },
    {
      professorId: mcgonagallId,
      disciplinaId: transfiguracaoId,
      turmaId: turma3Id,
    },
    { professorId: flitwickId, disciplinaId: feiticosId, turmaId: turma1Id },
    { professorId: flitwickId, disciplinaId: feiticosId, turmaId: turma3Id },
  ];

  for (const attr of atribuicoes) {
    if (attr.professorId && attr.disciplinaId && attr.turmaId) {
      try {
        await prisma.turmaDisciplina.upsert({
          where: {
            professorId_disciplinaId_turmaId: {
              professorId: attr.professorId!,
              disciplinaId: attr.disciplinaId!,
              turmaId: attr.turmaId!,
            },
          },
          update: {},
          create: {
            professorId: attr.professorId!,
            disciplinaId: attr.disciplinaId!,
            turmaId: attr.turmaId!,
          },
        });
      } catch (e: any) {
        console.error(`❌ Erro ao atribuir TurmaDisciplina: ${e.message}`);
      }
    }
  }

  // =========================================================================
  // 2.8 Matrículas
  // =========================================================================
  console.log("\n📝 Criando Matrículas...");
  if (feiticosId && pocoesId) {
    for (const aluno of alunosCriados) {
      const createMatricula = async (alunoId: number, disciplinaId: number) => {
        try {
          await prisma.matricula.upsert({
            where: { alunoId_disciplinaId: { alunoId, disciplinaId } },
            update: {},
            create: { alunoId, disciplinaId },
          });
        } catch {}
      };
      await createMatricula(aluno.id, feiticosId);
      if (aluno.nome.includes("Potter") || aluno.nome.includes("Malfoy"))
        await createMatricula(aluno.id, pocoesId);
    }
  }

  console.log("\n✅ SEED FINALIZADO!");
}

// =========================================================================
// 3. Execução do Seed
// =========================================================================

seedAll()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
