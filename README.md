Skill Swap Platform
Overview
The Skill Swap Platform is a web-based mini-application designed to foster a community where users can exchange skills directly. Instead of traditional monetary transactions, users can list skills they offer and skills they want in return, facilitating a collaborative learning and sharing environment. This project emphasizes sustainable knowledge exchange and community building.

This application was developed as part of the Odoo Hackathon '25, focusing on demonstrating robust backend API design, data modeling with a local database, and a responsive, intuitive user interface.

Features
User Management & Profiles
User Registration & Login: Secure email/password authentication using JWT (JSON Web Tokens).

Personalized Profiles: Users can create and manage their profiles, including name, location, profile photo, and availability.

Skill Listing: Users can list multiple skills they offer and skills they want in return.

Public/Private Profile Toggle: Users can choose whether their profile is visible to others for browsing.

Skill Swapping & Interaction
Browse & Search Users: Discover other users based on skills offered, skills wanted, and availability.

Detailed Swap Requests: Initiate a swap request by specifying:

One of your own offered skills.

One of the recipient's offered skills that you wish to receive.

An optional message.

Dashboard for Swap Management: A centralized dashboard for users to view and manage all their incoming and outgoing swap requests.

Accept/Reject Requests: Recipients can accept or reject pending incoming swap requests.

Cancel Requests: Senders can cancel their own pending outgoing swap requests.

Status Tracking: Requests are clearly marked with pending, accepted, rejected, or completed statuses.

Feedback & Rating System: After a swap is accepted, users can leave a star rating (1-5) and a comment for the other participant, which updates their overall profile rating.

Administrative Features
Admin Panel: A dedicated interface for administrators to oversee platform activities.

User Moderation: Admins can view all registered users and ban or unban them, controlling their access to the platform.

Swap Moderation: Admins can view all swap requests and manually change their statuses (e.g., pending, accepted, rejected, completed).

Technical Highlights
Custom Backend (Node.js & Express.js): Built from scratch to demonstrate backend API design and logic, fulfilling a key hackathon requirement.

Local Database (SQLite): All application data is persistently stored in a local skill_swap.db file, eliminating reliance on cloud-based Backend-as-a-Service (BaaS) platforms like Firebase for core data.

JWT Authentication: Secure, stateless authentication using JSON Web Tokens.

Real-time Communication (Socket.IO Foundation): Integrated Socket.IO for future real-time features like notifications (infrastructure is in place).

Responsive User Interface: Developed with React.js and Tailwind CSS to ensure a clean, modern, and adaptive design across various devices.

Modular Frontend: Organized into components and pages for maintainability and scalability.

Technologies Used
Frontend
React.js: JavaScript library for building user interfaces.

React Router DOM: For declarative routing in React applications.

Tailwind CSS: A utility-first CSS framework for rapid UI development.

Socket.IO Client: For real-time communication with the backend.

Backend
Node.js: JavaScript runtime environment.

Express.js: Fast, unopinionated, minimalist web framework for Node.js.

SQLite3: A C-language library that implements a small, fast, self-contained, high-reliability, full-featured, SQL database engine.

bcryptjs: For hashing passwords securely.

jsonwebtoken: For implementing JWT-based authentication.

uuid: For generating unique IDs.

cors: Node.js middleware for enabling Cross-Origin Resource Sharing.

dotenv: To load environment variables from a .env file.

nodemon: A tool that helps develop Node.js based applications by automatically restarting the node application when file changes in the directory are detected.

Socket.IO: For real-time, bidirectional event-based communication.

Getting Started (Local Setup)
Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

Prerequisites
Node.js: Make sure you have Node.js (LTS version recommended) installed. You can download it from nodejs.org.

npm (Node Package Manager): Comes bundled with Node.js.

1. Clone the Repository
git clone <your-repository-url>
cd odoo-hack-2025

2. Backend Setup
Navigate into the server directory, install dependencies, and start the server.

cd server
npm install

Create a .env file in the server directory with the following content:

JWT_SECRET=your_super_secret_jwt_key_please_change_this_in_production_and_keep_it_long
PORT=5000

Note: For the first run, the db.js script will automatically create a default admin user if no admin exists.

Start the backend server:

npm run dev

You should see messages like "Connected to the SQLite database." and "Server running on port 5000". If it's the first run, you'll also see "Default admin user created: admin@example.com / adminpassword".

3. Frontend Setup
Open a new terminal window, navigate into the client directory, install dependencies, and start the frontend development server.

cd ../client # Go back to the root, then into client
npm install
npm run dev

The frontend application will typically open in your browser at http://localhost:5173.

Testing & Demoing
Admin Access
Admin Email: admin@example.com

Admin Password: adminpassword

Log in using the regular login form. The "Admin Panel" link will appear in the Navbar, or you can navigate directly to /admin.

Registering Test Users (via Terminal)
To quickly populate your database with test users, you can use curl commands. Ensure your backend server is running (npm run dev in the server directory).

# Example: Register Alice Smith
curl -X POST http://localhost:5000/api/auth/register \
-H "Content-Type: application/json" \
-d '{
  "name": "Alice Smith",
  "email": "alice@example.com",
  "password": "password123",
  "location": "New York, NY",
  "skillsOffered": [{"name": "Python"}, {"name": "Web Development"}],
  "skillsWanted": [{"name": "Graphic Design"}, {"name": "Public Speaking"}],
  "availability": "Weekdays",
  "profilePhoto": "https://placehold.co/128x128/FF5733/FFFFFF?text=AS",
  "isPublic": true
}'
# Repeat similar commands for other users (Bob, Carol, etc., as provided in previous instructions)

You can find the full list of 10 example user registration curl commands in our chat history.

Simulating Swaps & Feedback
Log in a user (e.g., alice@example.com) via the frontend UI.

Browse users on the Home page.

Click "Request Swap" on another user's card (e.g., Bob Johnson).

Fill out the detailed swap request form (select skills, add message) and send it.

Go to your Dashboard to see the pending outgoing request.

Log out.

Log in as the recipient (e.g., bob@example.com).

Go to their Dashboard to see the incoming pending request.

Accept the request.

Now, for the accepted swap, a "Leave Feedback" button will appear. Click it, provide a rating and comment, and submit. This will mark the swap as "completed" and update the recipient's rating.

Admin Panel Usage
Log in as admin@example.com.

Navigate to the /admin route.

Explore "Manage Users" to ban/unban users.

Explore "Manage Swaps" to view all requests and manually change their statuses.

Future Enhancements (Ideas for Further Development)
Real-time Notifications: Fully implement Socket.IO to push real-time notifications for new swap requests, status updates, and feedback.

Chat/Messaging System: Allow users to communicate directly within the platform about swap details.

Advanced Search & Filtering: Implement more sophisticated search options (e.g., by location proximity, specific skill combinations).

User Reviews Display: Show detailed reviews on user profiles.

Admin UI for User Role Management: Allow admins to promote/demote users to/from admin status directly from the UI.

Swap Completion Flow: A more guided process for marking a swap as officially "completed" after the exchange of skills.

Image Uploads: Implement actual image uploads for profile photos instead of just URLs.

Contributing
Feel free to fork this repository, submit pull requests, or open issues.

License
This project is licensed under the MIT License.
