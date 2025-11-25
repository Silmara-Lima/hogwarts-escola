-- DropForeignKey
ALTER TABLE "TurmaDisciplina" DROP CONSTRAINT "TurmaDisciplina_professorId_fkey";

-- AddForeignKey
ALTER TABLE "TurmaDisciplina" ADD CONSTRAINT "TurmaDisciplina_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
