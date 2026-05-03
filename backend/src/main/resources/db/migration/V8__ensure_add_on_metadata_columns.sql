ALTER TABLE add_on_master
    ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE add_on_master
    ADD COLUMN IF NOT EXISTS image_url TEXT;
