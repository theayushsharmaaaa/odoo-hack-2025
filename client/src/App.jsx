// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import SwapRequestForm from './pages/SwapRequestForm';
import AdminPanel from './pages/AdminPanel';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-neutral-900 text-white font-inter">
          <Navbar />
          <main className="container mx-auto p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/swap-request/:toUserId" element={<SwapRequestForm />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;

