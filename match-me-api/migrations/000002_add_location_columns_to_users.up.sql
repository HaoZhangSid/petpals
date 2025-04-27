-- Add the geography column for coordinates
ALTER TABLE users ADD COLUMN coordinates GEOGRAPHY(Point, 4326) NULL;

-- Add the column for max recommendation radius
ALTER TABLE users ADD COLUMN max_recommendation_radius_km FLOAT8 NULL; 