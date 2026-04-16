import express from "express";
import db from "#db/client";

const app = express();
app.use(express.json()); 


app.get("/tracks", async (req, res) => {
  const { rows } = await db.query("SELECT * FROM tracks");
  res.send(rows);
});

app.get("/tracks/:id", async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) return res.status(400).send("ID must be a number");

  const { rows } = await db.query("SELECT * FROM tracks WHERE id = $1", [id]);
  
  if (rows.length > 0) {
    res.send(rows[0]); 
  } else {
    res.status(404).send("Track not found");
  }
});

app.get("/playlists", async (req, res) => {
  const { rows } = await db.query("SELECT * FROM playlists");
  res.send(rows);
});

app.post("/playlists", async (req, res) => {
  if (!req.body || !req.body.name || !req.body.description) {
    return res.status(400).send("Name and description required");
  }

  const { name, description } = req.body;
  const { rows } = await db.query(
    "INSERT INTO playlists (name, description) VALUES ($1, $2) RETURNING *",
    [name, description]
  );
  res.status(201).send(rows[0]);
});

app.get("/playlists/:id", async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).send("ID must be a number");

  const { rows } = await db.query("SELECT * FROM playlists WHERE id = $1", [id]);
  
  if (rows.length > 0) {
    res.send(rows[0]);
  } else {
    res.status(404).send("Playlist not found");
  }
});

app.get("/playlists/:id/tracks", async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).send("ID must be a number");

  // First check if the playlist exists
  const playlistCheck = await db.query("SELECT * FROM playlists WHERE id = $1", [id]);
  if (playlistCheck.rows.length === 0) return res.status(404).send("Playlist not found");

  const { rows } = await db.query(
    `SELECT tracks.* FROM tracks 
     JOIN playlists_tracks ON tracks.id = playlists_tracks.track_id 
     WHERE playlists_tracks.playlist_id = $1`,
    [id]
  );
  res.send(rows);
});

app.post("/playlists/:id/tracks", async (req, res) => {
  const { id } = req.params;
  
  if (!req.body || req.body.trackId === undefined) {
    return res.status(400).send("trackId required");
  }

  const { trackId } = req.body;
  if (isNaN(id) || isNaN(trackId)) return res.status(400).send("IDs must be numbers");

  try {
    const pCheck = await db.query("SELECT * FROM playlists WHERE id = $1", [id]);
    if (pCheck.rows.length === 0) return res.status(404).send("Playlist not found");

    const tCheck = await db.query("SELECT * FROM tracks WHERE id = $1", [trackId]);
    if (tCheck.rows.length === 0) return res.status(400).send("Track not found");

    const { rows } = await db.query(
      "INSERT INTO playlists_tracks (playlist_id, track_id) VALUES ($1, $2) RETURNING *",
      [id, trackId]
    );
    res.status(201).send(rows[0]);

  } catch (err) {
    if (err.code === "23505") {
      res.status(400).send("Track already in playlist");
    } else {
      res.status(500).send("Server error");
    }
  }
});

export default app;
