// src/pages/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Modal from '../components/Modal';

const Login = () => {
  const { login } = useAuth(); // Get the login function from AuthContext
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Call the login function from AuthContext, which now talks to your backend
      await login(email, password);
      setModalTitle('Login Successful');
      setModalMessage('You have successfully logged in!');
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        navigate('/'); // Navigate to home or dashboard after successful login
      }, 1500);
    } catch (error) {
      setModalTitle('Login Failed');
      setModalMessage(error.message || 'Invalid email or password. Please try again.');
      setShowModal(true);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-neutral-900 font-inter">
      <div className="bg-neutral-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-neutral-700 text-white">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">User Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-neutral-300 text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              id="email"
              className="w-full p-3 rounded-lg bg-neutral-700 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-neutral-300 text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              id="password"
              className="w-full p-3 rounded-lg bg-neutral-700 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-blue-800 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p className="text-center text-sm">
            <Link to="/register" className="text-blue-400 hover:underline">Don't have an account? Register here.</Link>
          </p>
          <p className="text-center text-sm">
            <Link to="/forgot-password" className="text-neutral-400 hover:underline">Forgot username/password</Link>
          </p>
        </form>
      </div>

      <Modal
        show={showModal}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default Login;

