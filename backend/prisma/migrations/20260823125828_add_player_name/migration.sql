-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GameResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectionId" TEXT NOT NULL,
    "playerName" TEXT NOT NULL DEFAULT 'Anonimo',
    "score" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "playedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GameResult_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GameResult" ("id", "playedAt", "score", "sectionId", "totalQuestions") SELECT "id", "playedAt", "score", "sectionId", "totalQuestions" FROM "GameResult";
DROP TABLE "GameResult";
ALTER TABLE "new_GameResult" RENAME TO "GameResult";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
