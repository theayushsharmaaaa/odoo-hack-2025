// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-neutral-900 text-white p-4 shadow-lg font-inter">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition duration-200">
          Skill Swap Platform
        </Link>
        <div className="flex items-center space-x-6">
          <Link to="/" className="hover:text-blue-300 transition duration-200">Home</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-blue-300 transition duration-200">Swap Requests</Link>
              <Link to="/profile" className="flex items-center space-x-2 hover:text-blue-300 transition duration-200">
                <img
                  src={user.photoURL || 'https://placehold.co/32x32/cccccc/000000?text=U'}
                  alt="User Profile"
                  className="w-8 h-8 rounded-full border-2 border-blue-500"
                />
                <span>{user.displayName || 'Profile'}</span>
              </Link>
              <button
                onClick={logout}
                className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200 shadow-md"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md">Login</Link>
              <Link to="/register" className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 shadow-md">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

