// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Use AuthContext for register
import Modal from '../components/Modal';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth(); // Get the register function from AuthContext

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setModalTitle('Password Mismatch');
      setModalMessage('Passwords do not match.');
      setShowModal(true);
      return;
    }

    setLoading(true);
    try {
      // Call the register function from AuthContext, which now talks to your backend
      await register({ name, email, password });

      setModalTitle('Registration Successful');
      setModalMessage('Your account has been created! You can now log in.');
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setModalTitle('Registration Failed');
      setModalMessage(error.message || 'Failed to register. Please try again.');
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-neutral-900 font-inter">
      <div className="bg-neutral-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-neutral-700 text-white">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">Register Account</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-neutral-300 text-sm font-semibold mb-2">Full Name</label>
            <input
              type="text"
              id="name"
              className="w-full p-3 rounded-lg bg-neutral-700 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
          <div>
            <label htmlFor="confirmPassword" className="block text-neutral-300 text-sm font-semibold mb-2">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full p-3 rounded-lg bg-neutral-700 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white py-3 rounded-lg font-semibold text-lg hover:from-green-600 hover:to-green-800 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
          <p className="text-center text-sm">
            <Link to="/login" className="text-blue-400 hover:underline">Already have an account? Login here.</Link>
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

export default Register;

