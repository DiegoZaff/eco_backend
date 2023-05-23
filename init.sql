
-- This file is used to create the database and tables
-- currently skipped while using named volumes

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- Create a users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  lastCarbonFootprint TIMESTAMP 
);

-- Insert mock users
INSERT INTO users (username, email, password)
VALUES
  ('claudio', 'claudio@123.com', 'password123'),
  ('giovanni', 'giovanni@example.com', 'password456'),
  ('diego', 'diego@example.com', '123456');



CREATE TABLE dailychallenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL,
  end_date TIMESTAMP NOT NULL,
  user_completed UUID[]
);


INSERT INTO dailychallenges (title, description, points, end_date, user_completed)
VALUES (
  'Take a 5 minute shower',
  'Take a 5 minute shower instead of a 10 minute shower, and save 10 gallons of water!',
  5,
  NOW() + INTERVAL '1 day',
  ARRAY[]::UUID[]),
(
  'Turn off the lights',
  'Turn off the lights when you leave the room, and save 1 kWh of electricity!',
  2,
  NOW() + INTERVAL '16 hours',
  ARRAY[]::UUID[]);
