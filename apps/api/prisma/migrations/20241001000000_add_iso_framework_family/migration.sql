-- Extend FrameworkFamily enum to support ISO frameworks

DO $$ BEGIN
    ALTER TYPE "FrameworkFamily" ADD VALUE IF NOT EXISTS 'ISO';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
