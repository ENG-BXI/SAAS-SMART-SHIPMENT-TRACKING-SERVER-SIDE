-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('complaint', 'inquiry', 'suggestion', 'compliment', 'feedback', 'other');

-- CreateTable
CREATE TABLE "note" (
    "id" TEXT NOT NULL,
    "type" "NoteType" NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "note_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
