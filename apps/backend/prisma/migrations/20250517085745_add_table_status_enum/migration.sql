/*
  Warnings:

  - The `status` column on the `Table` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `category` on the `Food` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING');

-- CreateEnum
CREATE TYPE "FoodCategory" AS ENUM ('MAIN_COURSE', 'APPETIZER', 'DESSERT', 'BEVERAGE', 'SOUP', 'SALAD', 'SIDE_DISH');

-- AlterTable
ALTER TABLE "Food" DROP COLUMN "category",
ADD COLUMN     "category" "FoodCategory" NOT NULL;

-- AlterTable
ALTER TABLE "Table" DROP COLUMN "status",
ADD COLUMN     "status" "TableStatus" NOT NULL DEFAULT 'AVAILABLE';
