-- CreateTable
CREATE TABLE "LawSection" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lawName" TEXT NOT NULL,
    "articleNumber" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "embedding" DOUBLE PRECISION[],

    CONSTRAINT "LawSection_pkey" PRIMARY KEY ("id")
);
