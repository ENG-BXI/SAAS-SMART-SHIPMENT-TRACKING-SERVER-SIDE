-- CreateTable
CREATE TABLE "client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contactWay" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "clientId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "contactWay_text_key" ON "contactWay"("text");

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "client_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contactWay" ADD CONSTRAINT "contactWay_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
