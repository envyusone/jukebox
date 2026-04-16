import db from "#db/client";

async function seed() {
  try {
    console.log("Cleaning up old data...");
   
    await db.query("TRUNCATE tracks, playlists, playlists_tracks RESTART IDENTITY CASCADE");

    console.log("Adding 20 tracks...");
    for (let i = 1; i <= 20; i++) {
      await db.query(
        "INSERT INTO tracks (name, duration_ms) VALUES ($1, $2)",
        [`Track ${i}`, 180000 + (i * 5000)]
      );
    }

    console.log("Adding 10 playlists...");
    for (let i = 1; i <= 10; i++) {
      await db.query(
        "INSERT INTO playlists (name, description) VALUES ($1, $2)",
        [`Playlist ${i}`, `A great mood for ${i}`]
      );
    }

    console.log("Linking 15 tracks to playlists...");
  
    for (let i = 1; i <= 15; i++) {
      await db.query(
        "INSERT INTO playlists_tracks (playlist_id, track_id) VALUES ($1, $2)",
        [1, i] 
      );
    }

    console.log("🌱 Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

await db.connect();
await seed();
await db.end();
