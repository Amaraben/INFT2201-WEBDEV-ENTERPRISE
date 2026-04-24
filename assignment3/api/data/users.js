// Simple in-memory "users table" for demo purposes.
// In a real system this would be in a database.

module.exports = [
  { id: 1, username: "admin", password: "admin123", role: "admin" },
  { id: 2, username: "user1", password: "user123", role: "user" },
  { id: 3, username: "user2", password: "user123", role: "user" }
];