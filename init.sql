
-- This file is used to create the database and tables
-- currently skipped while using named volumes

-- Create a users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert mock users
INSERT INTO users (username, email, password)
VALUES
  ('claudio', 'claudio@123.com', 'password123'),
  ('giovanni', 'giovanni@example.com', 'password456'),
  ('diego', 'diego@example.com', '123456');