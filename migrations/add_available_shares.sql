-- Add availableShares column to existing table
ALTER TABLE "BusniessPitchs" ADD COLUMN "availableShares" integer NOT NULL DEFAULT 10000;