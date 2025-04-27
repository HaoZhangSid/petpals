-- Remove the max recommendation radius column
ALTER TABLE users DROP COLUMN max_recommendation_radius_km;

-- Remove the geography column
ALTER TABLE users DROP COLUMN coordinates; 