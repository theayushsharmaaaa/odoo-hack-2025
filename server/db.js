// server/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs'); // Ensure bcryptjs is imported for admin password hashing

const DB_PATH = path.resolve(__dirname, 'skill_swap.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.serialize(() => {
      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        profilePhoto TEXT,
        location TEXT,
        skillsOffered TEXT,   -- Stored as JSON string
        skillsWanted TEXT,    -- Stored as JSON string
        availability TEXT,
        isPublic INTEGER,     -- 0 for false, 1 for true
        isAdmin INTEGER DEFAULT 0, -- 0 for false, 1 for true
        isActive INTEGER DEFAULT 1, -- 0 for banned, 1 for active
        rating REAL DEFAULT 0,
        reviews INTEGER DEFAULT 0,
        createdAt TEXT
      )`, (err) => {
        if (err) console.error("Error creating users table:", err.message);
        else {
          console.log("Users table ensured.");
          // Optional: Insert a default admin user if none exists for testing
          db.get(`SELECT COUNT(*) as count FROM users WHERE isAdmin = 1`, (err, row) => {
            if (err) {
              console.error("Error checking for admin user:", err.message);
              return;
            }
            if (row.count === 0) {
              // Ensure bcryptjs is correctly used here
              const hashedPassword = bcrypt.hashSync('adminpassword', 10); // Hash a default admin password
              db.run(`INSERT INTO users (id, name, email, password, isAdmin, isPublic, createdAt, isActive)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                ['admin-user-id', 'Admin User', 'admin@example.com', hashedPassword, 1, 0, new Date().toISOString(), 1],
                (err) => {
                  if (err) console.error("Error inserting default admin user:", err.message);
                  else console.log("Default admin user created: admin@example.com / adminpassword");
                }
              );
            }
          });
        }
      });

      // Swap Requests table
      db.run(`CREATE TABLE IF NOT EXISTS swap_requests (
        id TEXT PRIMARY KEY,
        fromUserId TEXT NOT NULL,
        toUserId TEXT NOT NULL,
        status TEXT NOT NULL, -- 'pending', 'accepted', 'rejected', 'completed' (after feedback)
        offeredSkill TEXT,    -- Stored as JSON string (e.g., { name: "skill" })
        wantedSkill TEXT,     -- Stored as JSON string (e.g., { name: "skill" })
        message TEXT,
        createdAt TEXT,
        FOREIGN KEY (fromUserId) REFERENCES users(id),
        FOREIGN KEY (toUserId) REFERENCES users(id)
      )`, (err) => {
        if (err) console.error("Error creating swap_requests table:", err.message);
        else console.log("Swap requests table ensured.");
      });

      // Feedback table
      db.run(`CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY,
        swapRequestId TEXT NOT NULL UNIQUE, -- Ensure one feedback per swap
        fromUserId TEXT NOT NULL, -- User who gave the feedback
        toUserId TEXT NOT NULL,   -- User who received the feedback
        rating INTEGER NOT NULL,  -- 1-5 stars
        comment TEXT,
        createdAt TEXT,
        FOREIGN KEY (swapRequestId) REFERENCES swap_requests(id),
        FOREIGN KEY (fromUserId) REFERENCES users(id),
        FOREIGN KEY (toUserId) REFERENCES users(id)
      )`, (err) => {
        if (err) console.error("Error creating feedback table:", err.message);
        else console.log("Feedback table ensured.");
      });
    });
  }
});

module.exports = db;

