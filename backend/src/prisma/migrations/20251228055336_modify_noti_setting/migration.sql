-- AlterTable
ALTER TABLE "user_settings" ADD COLUMN     "reminderTimes" TEXT[] DEFAULT ARRAY['20:00']::TEXT[];
