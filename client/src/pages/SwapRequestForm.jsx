// src/pages/SwapRequestForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const SwapRequestForm = () => {
  const { toUserId } = useParams(); // Get the ID of the user to swap with from URL params
  const navigate = useNavigate();
  const { user, token, API_BASE_URL, logout } = useAuth();

  const [recipient, setRecipient] = useState(null);
  const [mySkills, setMySkills] = useState([]);
  // CHANGED: recipientSkills will now be the recipient's offered skills
  const [recipientOfferedSkills, setRecipientOfferedSkills] = useState([]);

  const [selectedMySkill, setSelectedMySkill] = useState('');
  const [selectedRecipientSkill, setSelectedRecipientSkill] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    const fetchSwapData = async () => {
      if (!user || !token || !toUserId) {
        setLoading(false);
        navigate('/login'); // Redirect if not authenticated or no recipient
        return;
      }

      try {
        // Fetch current user's profile to get their skills offered
        const myProfileRes = await fetch(`${API_BASE_URL}/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (myProfileRes.status === 403) { logout(); navigate('/login'); return; }
        if (!myProfileRes.ok) throw new Error('Failed to fetch your profile');
        const myProfileData = await myProfileRes.json();
        setMySkills(myProfileData.skillsOffered || []);

        // Fetch recipient's profile to get their skills offered
        // We'll fetch all public users and find the recipient, ensuring we get their offered skills
        const publicUsersRes = await fetch(`${API_BASE_URL}/users`);
        if (!publicUsersRes.ok) throw new Error('Failed to fetch public users');
        const allPublicUsers = await publicUsersRes.json();
        const foundRecipient = allPublicUsers.find(u => u.id === toUserId);

        if (!foundRecipient) {
          setModalTitle('Error');
          setModalMessage('Recipient user not found.');
          setShowModal(true);
          setLoading(false);
          return;
        }
        setRecipient(foundRecipient);
        // CHANGED: Set recipientOfferedSkills to the recipient's skillsOffered
        setRecipientOfferedSkills(foundRecipient.skillsOffered || []);

      } catch (error) {
        console.error('Error fetching swap data:', error);
        setModalTitle('Error');
        setModalMessage(error.message || 'Failed to load swap details.');
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSwapData();
  }, [user, token, toUserId, API_BASE_URL, navigate, logout]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMySkill || !selectedRecipientSkill) {
      setModalTitle('Missing Information');
      setModalMessage('Please select both your offered skill and the recipient\'s offered skill.');
      setShowModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/swaps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          toUserId: recipient.id,
          offeredSkill: { name: selectedMySkill }, // Your skill you are offering
          wantedSkill: { name: selectedRecipientSkill }, // Recipient's skill you are requesting
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send swap request');
      }

      setModalTitle('Success');
      setModalMessage('Swap request sent successfully!');
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        navigate('/dashboard'); // Go to dashboard to see pending requests
      }, 1500);
    } catch (error) {
      console.error('Error sending swap request:', error);
      setModalTitle('Error');
      setModalMessage(error.message || 'Failed to send swap request. Please try again.');
      setShowModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)] text-xl text-neutral-300">
        Loading swap request form...
      </div>
    );
  }

  if (!user || !recipient) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)] text-xl text-red-400">
        Error: User or recipient data not available. Please try again.
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-neutral-900 text-white font-inter">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-blue-400">Request Swap with {recipient.name}</h2>

      <div className="bg-neutral-800 p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-auto border border-neutral-700">
        <div className="flex items-center gap-4 mb-6">
          <img
            src={recipient.profilePhoto || 'https://placehold.co/64x64/cccccc/000000?text=U'}
            alt={recipient.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
          />
          <div>
            <p className="text-2xl font-bold text-blue-300">{recipient.name}</p>
            <p className="text-md text-neutral-400">{recipient.location}</p>
            <p className="text-md text-yellow-400">Rating: {recipient.rating?.toFixed(1) || 'N/A'} / 5</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="mySkill" className="block text-neutral-300 text-sm font-semibold mb-2">Your Skill to Offer</label>
            <select
              id="mySkill"
              className="w-full p-3 rounded-lg bg-neutral-700 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              value={selectedMySkill}
              onChange={(e) => setSelectedMySkill(e.target.value)}
              required
            >
              <option value="">Select a skill you offer</option>
              {mySkills.length > 0 ? (
                mySkills.map((skill, index) => (
                  <option key={index} value={skill.name}>{skill.name}</option>
                ))
              ) : (
                <option value="" disabled>No skills offered on your profile.</option>
              )}
            </select>
            {mySkills.length === 0 && (
                <p className="text-red-400 text-sm mt-2">Please add skills to your profile to offer them for a swap.</p>
            )}
          </div>

          <div>
            {/* CHANGED LABEL */}
            <label htmlFor="recipientSkill" className="block text-neutral-300 text-sm font-semibold mb-2">{recipient.name}'s Skill You Want to Receive</label>
            <select
              id="recipientSkill"
              className="w-full p-3 rounded-lg bg-neutral-700 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              value={selectedRecipientSkill}
              onChange={(e) => setSelectedRecipientSkill(e.target.value)}
              required
            >
              <option value="">Select a skill {recipient.name} offers</option>
              {/* CHANGED: Use recipientOfferedSkills here */}
              {recipientOfferedSkills.length > 0 ? (
                recipientOfferedSkills.map((skill, index) => (
                  <option key={index} value={skill.name}>{skill.name}</option>
                ))
              ) : (
                <option value="" disabled>No skills offered on {recipient.name}'s profile.</option>
              )}
            </select>
            {recipientOfferedSkills.length === 0 && (
                <p className="text-red-400 text-sm mt-2">{recipient.name} has not listed any skills they offer. You might want to contact them directly.</p>
            )}
          </div>

          <div>
            <label htmlFor="message" className="block text-neutral-300 text-sm font-semibold mb-2">Message (Optional)</label>
            <textarea
              id="message"
              rows="4"
              className="w-full p-3 rounded-lg bg-neutral-700 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hi ${recipient.name}, I'm interested in swapping skills...`}
            ></textarea>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-neutral-600 text-white px-6 py-3 rounded-lg hover:bg-neutral-700 transition duration-200 shadow-md font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-800 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg font-semibold"
              disabled={isSubmitting || mySkills.length === 0 || recipientOfferedSkills.length === 0}
            >
              {isSubmitting ? 'Sending Request...' : 'Send Swap Request'}
            </button>
          </div>
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

export default SwapRequestForm;

