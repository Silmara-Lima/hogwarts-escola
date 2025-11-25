/*
  Warnings:

  - A unique constraint covering the columns `[matricula]` on the table `Aluno` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[matricula]` on the table `Professor` will be added. If there are existing duplicate values, this will fail.
  - Made the column `turmaId` on table `Aluno` required. This step will fail if there are existing NULL values in that column.
  - Made the column `matricula` on table `Professor` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Aluno" DROP CONSTRAINT "Aluno_turmaId_fkey";

-- AlterTable
ALTER TABLE "Aluno" ADD COLUMN     "matricula" TEXT,
ALTER COLUMN "turmaId" SET NOT NULL,
ALTER COLUMN "dataNascimento" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "Professor" ALTER COLUMN "matricula" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_matricula_key" ON "Aluno"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "Professor_matricula_key" ON "Professor"("matricula");

-- CreateIndex
CREATE INDEX "TurmaDisciplina_turmaId_disciplinaId_idx" ON "TurmaDisciplina"("turmaId", "disciplinaId");

-- AddForeignKey
ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
