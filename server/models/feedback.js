// server/models/feedback.js
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

class Feedback {
  static async create({ swapRequestId, fromUserId, toUserId, rating, comment }) {
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    return new Promise((resolve, reject) => {
      db.run(`INSERT INTO feedback (id, swapRequestId, fromUserId, toUserId, rating, comment, createdAt)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, swapRequestId, fromUserId, toUserId, rating, comment || null, createdAt],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, swapRequestId, fromUserId, toUserId, rating, comment, createdAt });
          }
        }
      );
    });
  }

  static async findByToUserId(toUserId) { // Get all feedback for a specific user
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM feedback WHERE toUserId = ? ORDER BY createdAt DESC`, [toUserId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = Feedback;

