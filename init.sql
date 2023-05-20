-- Create a new database
CREATE DATABASE mydatabase;

-- Switch to the new database
\c mydatabase;

-- Create a users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert mock users
INSERT INTO users (username, email, password)
VALUES
  ('john_doe', 'john@example.com', 'password123'),
  ('jane_smith', 'jane@example.com', 'password456');