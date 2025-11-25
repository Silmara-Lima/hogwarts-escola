/*
  Warnings:

  - Made the column `matricula` on table `Aluno` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Aluno" ALTER COLUMN "matricula" SET NOT NULL;
