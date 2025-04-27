-- Create spatial index on the coordinates column for efficient location queries
CREATE INDEX idx_users_coordinates_gist ON users USING GIST (coordinates); 