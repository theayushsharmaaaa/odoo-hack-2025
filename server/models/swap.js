// server/models/swap.js
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

class SwapRequest {
  static async create({ fromUserId, toUserId, offeredSkill, wantedSkill, message }) {
    const id = uuidv4();
    const status = 'pending'; // Initial status
    const createdAt = new Date().toISOString();
    return new Promise((resolve, reject) => {
      db.run(`INSERT INTO swap_requests (id, fromUserId, toUserId, status, offeredSkill, wantedSkill, message, createdAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, fromUserId, toUserId, status,
         offeredSkill ? JSON.stringify(offeredSkill) : null, // Ensure these are correctly stringified objects
         wantedSkill ? JSON.stringify(wantedSkill) : null,   // Ensure these are correctly stringified objects
         message || null, createdAt],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, fromUserId, toUserId, status, offeredSkill, wantedSkill, message, createdAt });
          }
        }
      );
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM swap_requests WHERE id = ?`, [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          row.offeredSkill = row.offeredSkill ? JSON.parse(row.offeredSkill) : null;
          row.wantedSkill = row.wantedSkill ? JSON.parse(row.wantedSkill) : null;
          resolve(row);
        } else {
          resolve(null);
        }
      });
    });
  }

  static async findUserRequests(userId) {
    return new Promise((resolve, reject) => {
      // Find requests where the user is either the sender or the receiver
      db.all(`SELECT * FROM swap_requests WHERE fromUserId = ? OR toUserId = ? ORDER BY createdAt DESC`,
        [userId, userId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            const requests = rows.map(row => ({
              ...row,
              offeredSkill: row.offeredSkill ? JSON.parse(row.offeredSkill) : null,
              wantedSkill: row.wantedSkill ? JSON.parse(row.wantedSkill) : null,
            }));
            resolve(requests);
          }
        }
      );
    });
  }

  static async updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      db.run(`UPDATE swap_requests SET status = ? WHERE id = ?`, [status, id], function (err) {
        if (err) {
          reject(err);
        } else if (this.changes > 0) {
          resolve(true); // Indicates success
        } else {
          resolve(false); // Request not found or no changes
        }
      });
    });
  }

  static async findExistingSwap(fromUserId, toUserId) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM swap_requests WHERE
                (fromUserId = ? AND toUserId = ? AND (status = 'pending' OR status = 'accepted')) OR
                (fromUserId = ? AND toUserId = ? AND (status = 'pending' OR status = 'accepted'))`,
        [fromUserId, toUserId, toUserId, fromUserId], // Check both directions
        (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve(row); // Found an existing pending/accepted swap
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  static async delete(id) { // NEW: Delete a swap request
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM swap_requests WHERE id = ?`, [id], function (err) {
        if (err) {
          reject(err);
        } else if (this.changes > 0) {
          resolve(true); // Indicates success
        } else {
          resolve(false); // Request not found
        }
      });
    });
  }
}

module.exports = SwapRequest;

