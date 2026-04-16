-- 1. Clean up existing tables (order matters because of foreign keys)
DROP TABLE IF EXISTS playlists_tracks;
DROP TABLE IF EXISTS playlists;
DROP TABLE IF EXISTS tracks;


-- 2. Create the Tracks table
CREATE TABLE tracks (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    duration_ms INTEGER NOT NULL -- Expected by server.test.js
);

-- 3. Create the Playlists table
CREATE TABLE playlists (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT -- Expected by server.test.js
);

-- 4. Create the Junction table (Many-to-Many)
CREATE TABLE playlists_tracks (
    id SERIAL PRIMARY KEY,
    -- Requirement: Deletion should cascade
    playlist_id INTEGER REFERENCES playlists(id) ON DELETE CASCADE,
    track_id INTEGER REFERENCES tracks(id) ON DELETE CASCADE,
    -- Requirement: Each track can only be in a playlist once
    UNIQUE(playlist_id, track_id)
);
