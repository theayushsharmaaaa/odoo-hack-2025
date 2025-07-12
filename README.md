# Skill Swap Platform

The **Skill Swap Platform** is a web-based mini-application designed to foster a community where users can exchange skills directly. Instead of traditional monetary transactions, users can list skills they offer and skills they want in return, facilitating a collaborative learning and sharing environment. This project emphasizes sustainable knowledge exchange and community building.

> 🏁 Developed as part of the **Odoo Hackathon '25**, focusing on robust backend API design, data modeling with a local database, and a responsive, intuitive user interface.

---

## 🚀 Features

### 👤 User Management & Profiles

- **User Registration & Login**: Secure email/password authentication using **JWT (JSON Web Tokens)**.
- **Personalized Profiles**: Includes name, location, profile photo, and availability.
- **Skill Listing**: Users can list multiple skills they **offer** and **want**.
- **Public/Private Profile Toggle**: Control your profile's visibility to others.

### 🔁 Skill Swapping & Interaction

- **Browse & Search Users**: Discover users based on skills offered/wanted and availability.
- **Detailed Swap Requests**:
  - Select a skill you offer.
  - Choose a skill you want from the other user.
  - Add an optional message.
- **Swap Management Dashboard**:
  - View/manage incoming and outgoing swap requests.
  - Accept/Reject/Cancel swaps.
  - Track statuses: `Pending`, `Accepted`, `Rejected`, `Completed`.
- **Feedback & Rating System**:
  - Leave a star rating (1–5) and comment after a successful swap.
  - Profile ratings are dynamically updated.

### 🛠️ Administrative Features

- **Admin Panel**: Dedicated UI for administrators.
- **User Moderation**: Ban/unban users.
- **Swap Moderation**: View and manually change the status of any swap request.

---

## 🧰 Technical Highlights

- **Custom Backend**: Node.js + Express.js, built from scratch (no Firebase/BaaS).
- **Local SQLite3 Database**: Stored in `skill_swap.db`.
- **JWT Authentication**: Secure and stateless.
- **Real-time Socket.IO Foundation**: Ready for real-time features like notifications.
- **Frontend**: React.js + Tailwind CSS (responsive, clean design).
- **Modular Frontend**: Well-organized components and pages.

---

## 🧱 Technologies Used

### Frontend
- [React.js](https://reactjs.org/)
- [React Router DOM](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Socket.IO Client](https://socket.io/)

### Backend
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [SQLite3](https://www.sqlite.org/)
- [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- [uuid](https://www.npmjs.com/package/uuid)
- [cors](https://www.npmjs.com/package/cors)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [nodemon](https://www.npmjs.com/package/nodemon)
- [Socket.IO](https://socket.io/)

---

## 🛠️ Getting Started (Local Setup)

### 📦 Prerequisites

- **Node.js** (LTS version recommended) — [Download Here](https://nodejs.org/)
- **npm** (comes with Node.js)

---

## ⚙️ Backend Setup

```bash
git clone https://github.com/your-username/odoo-hack-2025.git
cd odoo-hack-2025/server
npm install
