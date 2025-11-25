/*
  Warnings:

  - Added the required column `telefone` to the `Aluno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cor` to the `Casa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `diretor` to the `Casa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cargaHoraria` to the `Disciplina` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eObrigatoria` to the `Disciplina` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departamento` to the `Professor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Aluno" ADD COLUMN     "telefone" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Casa" ADD COLUMN     "cor" TEXT NOT NULL,
ADD COLUMN     "diretor" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Disciplina" ADD COLUMN     "cargaHoraria" INTEGER NOT NULL,
ADD COLUMN     "eObrigatoria" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Professor" ADD COLUMN     "departamento" TEXT NOT NULL,
ADD COLUMN     "matricula" TEXT;
