// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <nav className="bg-neutral-900 p-4 shadow-lg border-b border-neutral-700 font-inter">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold hover:text-blue-400 transition duration-200">
          Skill Swap
        </Link>
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-neutral-300 hover:text-white transition duration-200">Home</Link>
          {user ? (
            <>
              <Link to="/profile" className="text-neutral-300 hover:text-white transition duration-200">Profile</Link>
              <Link to="/dashboard" className="text-neutral-300 hover:text-white transition duration-200">Dashboard</Link>
              {user.isAdmin && ( // Only show Admin Panel link if user is admin
                <Link to="/admin" className="text-red-400 font-semibold hover:text-red-300 transition duration-200">Admin Panel</Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-md"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-neutral-300 hover:text-white transition duration-200">Login</Link>
              <Link to="/register" className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition duration-200 shadow-md">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

