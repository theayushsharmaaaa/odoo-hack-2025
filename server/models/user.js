// server/models/user.js
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

class User {
  static async create({ name, email, password, profilePhoto, location, skillsOffered, skillsWanted, availability, isPublic, isAdmin = false }) { // Added isAdmin
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    return new Promise((resolve, reject) => {
      db.run(`INSERT INTO users (id, name, email, password, profilePhoto, location, skillsOffered, skillsWanted, availability, isPublic, isAdmin, rating, reviews, createdAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, name, email, password, profilePhoto || null, location || null,
         JSON.stringify(skillsOffered || []), JSON.stringify(skillsWanted || []),
         availability || 'Any', isPublic ? 1 : 0, isAdmin ? 1 : 0, 0, 0, createdAt], // Added isAdmin
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, name, email, profilePhoto, location, skillsOffered, skillsWanted, availability, isPublic, isAdmin, rating: 0, reviews: 0, createdAt }); // Added isAdmin
          }
        }
      );
    });
  }

  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          // Parse JSON strings back to arrays/objects
          row.skillsOffered = row.skillsOffered ? JSON.parse(row.skillsOffered) : [];
          row.skillsWanted = row.skillsWanted ? JSON.parse(row.skillsWanted) : [];
          row.isPublic = row.isPublic === 1; // Convert back to boolean
          row.isAdmin = row.isAdmin === 1; // Convert back to boolean
          resolve(row);
        } else {
          resolve(null);
        }
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          row.skillsOffered = row.skillsOffered ? JSON.parse(row.skillsOffered) : [];
          row.skillsWanted = row.skillsWanted ? JSON.parse(row.skillsWanted) : [];
          row.isPublic = row.isPublic === 1;
          row.isAdmin = row.isAdmin === 1; // Convert back to boolean
          resolve(row);
        } else {
          resolve(null);
        }
      });
    });
  }

  static async findAllPublic() {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM users WHERE isPublic = 1`, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const users = rows.map(row => ({
            ...row,
            skillsOffered: row.skillsOffered ? JSON.parse(row.skillsOffered) : [],
            skillsWanted: row.skillsWanted ? JSON.parse(row.skillsWanted) : [],
            isPublic: row.isPublic === 1,
            isAdmin: row.isAdmin === 1 // Added
          }));
          resolve(users);
        }
      });
    });
  }

  static async findAll() { // New method to get all users for admin
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM users`, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const users = rows.map(row => ({
            ...row,
            skillsOffered: row.skillsOffered ? JSON.parse(row.skillsOffered) : [],
            skillsWanted: row.skillsWanted ? JSON.parse(row.skillsWanted) : [],
            isPublic: row.isPublic === 1,
            isAdmin: row.isAdmin === 1
          }));
          resolve(users);
        }
      });
    });
  }

  static async update(id, { name, profilePhoto, location, skillsOffered, skillsWanted, availability, isPublic, isAdmin }) { // Added isAdmin
    return new Promise((resolve, reject) => {
      db.run(`UPDATE users SET name = ?, profilePhoto = ?, location = ?, skillsOffered = ?, skillsWanted = ?, availability = ?, isPublic = ?, isAdmin = ? WHERE id = ?`,
        [name, profilePhoto, location,
         JSON.stringify(skillsOffered || []), JSON.stringify(skillsWanted || []),
         availability, isPublic ? 1 : 0, isAdmin ? 1 : 0, id], // Added isAdmin
        function (err) {
          if (err) {
            reject(err);
          } else if (this.changes > 0) {
            resolve(true); // Indicates success
          } else {
            resolve(false); // User not found or no changes
          }
        }
      );
    });
  }

  static async updateRating(userId, newRating) { // NEW: Update user rating
    return new Promise((resolve, reject) => {
      db.get(`SELECT rating, reviews FROM users WHERE id = ?`, [userId], (err, row) => {
        if (err) {
          return reject(err);
        }
        if (!row) {
          return reject(new Error('User not found'));
        }

        const currentRatingSum = row.rating * row.reviews;
        const newReviewsCount = row.reviews + 1;
        const updatedRatingSum = currentRatingSum + newRating;
        const updatedAverageRating = updatedRatingSum / newReviewsCount;

        db.run(`UPDATE users SET rating = ?, reviews = ? WHERE id = ?`,
          [updatedAverageRating, newReviewsCount, userId],
          function (err) {
            if (err) {
              reject(err);
            } else if (this.changes > 0) {
              resolve(true);
            } else {
              resolve(false);
            }
          }
        );
      });
    });
  }

  static async updateIsActive(id, isActive) { // NEW: For admin to ban/unban
    return new Promise((resolve, reject) => {
      db.run(`UPDATE users SET isActive = ? WHERE id = ?`, [isActive ? 1 : 0, id], function (err) {
        if (err) {
          reject(err);
        } else if (this.changes > 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }
}

module.exports = User;

