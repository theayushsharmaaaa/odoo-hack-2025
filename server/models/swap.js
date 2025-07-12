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
         offeredSkill ? JSON.stringify(offeredSkill) : null,
         wantedSkill ? JSON.stringify(wantedSkill) : null,
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

  // MODIFIED: findUserRequests can now optionally return all requests if userId is null/undefined
  static async findUserRequests(userId) {
    return new Promise((resolve, reject) => {
      let query = `SELECT * FROM swap_requests`;
      let params = [];

      if (userId) { // If userId is provided, filter by it
        query += ` WHERE fromUserId = ? OR toUserId = ?`;
        params = [userId, userId];
      }
      query += ` ORDER BY createdAt DESC`; // Always order by creation date

      db.all(query, params, (err, rows) => {
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
      });
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

  static async delete(id) {
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

