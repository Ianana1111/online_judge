ALTER TABLE "problems" ADD COLUMN "judgeDataVersion" INTEGER NOT NULL DEFAULT 1;

CREATE TABLE "problem_editorials" (
  "id" TEXT NOT NULL,
  "problemId" TEXT NOT NULL,
  "revision" INTEGER NOT NULL,
  "content" JSONB NOT NULL,
  "contentHash" TEXT NOT NULL,
  "judgeFingerprint" TEXT NOT NULL,
  "judgeRevision" TEXT NOT NULL,
  "verifiedProblemVersion" INTEGER NOT NULL,
  "verifiedAt" TIMESTAMP(3) NOT NULL,
  "validationReport" JSONB NOT NULL,
  "publishedAt" TIMESTAMP(3),
  "supersededAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "problem_editorials_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "problem_editorials_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "editorial_positive_versions" CHECK ("revision" > 0 AND "verifiedProblemVersion" > 0)
);
CREATE UNIQUE INDEX "problem_editorials_problemId_revision_key" ON "problem_editorials"("problemId", "revision");
CREATE INDEX "problem_editorials_problemId_publishedAt_idx" ON "problem_editorials"("problemId", "publishedAt");
CREATE UNIQUE INDEX "problem_editorials_one_current" ON "problem_editorials"("problemId") WHERE "publishedAt" IS NOT NULL AND "supersededAt" IS NULL;

-- Invalidate evidence even when an old seed, admin tool or SQL script changes the data.
-- Updating the version itself does not recursively trigger this statement/settings trigger.
CREATE FUNCTION "advance_problem_judge_version"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF ROW(OLD."statementMd", OLD."inputSpecMd", OLD."outputSpecMd", OLD."timeLimitMs", OLD."memoryLimitKb", OLD."checkerType", OLD."floatEps", OLD."uvaId", OLD."uvaPid", OLD."sourceUrl")
    IS DISTINCT FROM ROW(NEW."statementMd", NEW."inputSpecMd", NEW."outputSpecMd", NEW."timeLimitMs", NEW."memoryLimitKb", NEW."checkerType", NEW."floatEps", NEW."uvaId", NEW."uvaPid", NEW."sourceUrl") THEN
    NEW."judgeDataVersion" := OLD."judgeDataVersion" + 1;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "problem_judge_version" BEFORE UPDATE OF "statementMd", "inputSpecMd", "outputSpecMd", "timeLimitMs", "memoryLimitKb", "checkerType", "floatEps", "uvaId", "uvaPid", "sourceUrl" ON "problems"
FOR EACH ROW EXECUTE FUNCTION "advance_problem_judge_version"();

CREATE FUNCTION "invalidate_editorial_case_evidence"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE "problems" SET "judgeDataVersion" = "judgeDataVersion" + 1 WHERE "id" = NEW."problemId";
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE "problems" SET "judgeDataVersion" = "judgeDataVersion" + 1 WHERE "id" = OLD."problemId";
  ELSIF ROW(OLD."problemId", OLD."ord", OLD."input", OLD."output") IS DISTINCT FROM ROW(NEW."problemId", NEW."ord", NEW."input", NEW."output") THEN
    UPDATE "problems" SET "judgeDataVersion" = "judgeDataVersion" + 1 WHERE "id" IN (OLD."problemId", NEW."problemId");
  END IF;
  RETURN NULL;
END;
$$;
CREATE TRIGGER "sample_editorial_evidence" AFTER INSERT OR UPDATE OR DELETE ON "samples" FOR EACH ROW EXECUTE FUNCTION "invalidate_editorial_case_evidence"();
CREATE TRIGGER "test_case_editorial_evidence" AFTER INSERT OR UPDATE OR DELETE ON "test_cases" FOR EACH ROW EXECUTE FUNCTION "invalidate_editorial_case_evidence"();

CREATE FUNCTION "preserve_published_editorial"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD."publishedAt" IS NOT NULL AND ROW(OLD."problemId", OLD."revision", OLD."content", OLD."contentHash", OLD."judgeFingerprint", OLD."judgeRevision", OLD."verifiedProblemVersion", OLD."verifiedAt", OLD."validationReport", OLD."publishedAt")
    IS DISTINCT FROM ROW(NEW."problemId", NEW."revision", NEW."content", NEW."contentHash", NEW."judgeFingerprint", NEW."judgeRevision", NEW."verifiedProblemVersion", NEW."verifiedAt", NEW."validationReport", NEW."publishedAt") THEN
    RAISE EXCEPTION 'Published editorials are immutable; create a new revision';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "immutable_published_editorial" BEFORE UPDATE ON "problem_editorials" FOR EACH ROW EXECUTE FUNCTION "preserve_published_editorial"();
