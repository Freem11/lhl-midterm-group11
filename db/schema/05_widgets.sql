-- Drop and recreate Widgets table (Example)

DROP TABLE IF EXISTS pins CASCADE;
CREATE TABLE pins (
  id SERIAL PRIMARY KEY NOT NULL,
  contributor_id INTEGER NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  map_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(255) NOT NULL,
  longitude REAL,
  latitude REAL,
  layer_id INTEGER NOT NULL REFERENCES layers(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS layers CASCADE;
CREATE TABLE layers (
  id SERIAL PRIMARY KEY NOT NULL,
  title VARCHAR(255) NOT NULL,
  user INTEGER NOT NULL REFERENCES maps(id) ON DELETE CASCADE
);
