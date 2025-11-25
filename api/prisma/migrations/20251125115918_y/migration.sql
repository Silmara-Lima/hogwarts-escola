-- DropForeignKey
ALTER TABLE "TurmaDisciplina" DROP CONSTRAINT "TurmaDisciplina_disciplinaId_fkey";

-- AddForeignKey
ALTER TABLE "TurmaDisciplina" ADD CONSTRAINT "TurmaDisciplina_disciplinaId_fkey" FOREIGN KEY ("disciplinaId") REFERENCES "Disciplina"("id") ON DELETE CASCADE ON UPDATE CASCADE;
