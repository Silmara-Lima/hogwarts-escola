/*
  Warnings:

  - Added the required column `dataNascimento` to the `Aluno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefone` to the `Professor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Aluno" ADD COLUMN     "dataNascimento" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Professor" ADD COLUMN     "telefone" TEXT NOT NULL;
