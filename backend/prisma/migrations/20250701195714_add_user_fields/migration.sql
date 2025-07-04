/*
  Warnings:

  - Added the required column `apellidoMaterno` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apellidoPaterno` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `calle` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ciudad` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `codigoPostal` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `colonia` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estado` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombres` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numero` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referencias` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefono` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "apellidoMaterno" TEXT NOT NULL,
ADD COLUMN     "apellidoPaterno" TEXT NOT NULL,
ADD COLUMN     "calle" TEXT NOT NULL,
ADD COLUMN     "ciudad" TEXT NOT NULL,
ADD COLUMN     "codigoPostal" TEXT NOT NULL,
ADD COLUMN     "colonia" TEXT NOT NULL,
ADD COLUMN     "estado" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "nombres" TEXT NOT NULL,
ADD COLUMN     "numero" TEXT NOT NULL,
ADD COLUMN     "referencias" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'customer',
ADD COLUMN     "telefono" TEXT NOT NULL;
