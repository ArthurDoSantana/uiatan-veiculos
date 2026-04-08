-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "costPrice" DOUBLE PRECISION,
ADD COLUMN     "fipeCode" TEXT,
ADD COLUMN     "fipePrice" DOUBLE PRECISION,
ADD COLUMN     "fipeUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "plate" TEXT;
