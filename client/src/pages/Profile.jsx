// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const Profile = () => {
  const { user, token, API_BASE_URL, logout } = useAuth();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [skillsOffered, setSkillsOffered] = useState([]);
  const [skillsWanted, setSkillsWanted] = useState([]);
  const [availability, setAvailability] = useState('Any');
  const [isPublic, setIsPublic] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // Temp state for new skill input
  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillWanted, setNewSkillWanted] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user || !token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.status === 403) { // Token expired or invalid
            logout(); // Log out the user
            setModalTitle('Session Expired');
            setModalMessage('Your session has expired. Please log in again.');
            setShowModal(true);
            return;
        }

        if (!res.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await res.json();
        setName(data.name || '');
        setLocation(data.location || '');
        setSkillsOffered(data.skillsOffered || []);
        setSkillsWanted(data.skillsWanted || []);
        setAvailability(data.availability || 'Any');
        setIsPublic(data.isPublic !== undefined ? data.isPublic : true);
        setProfilePhoto(data.profilePhoto || 'https://placehold.co/64x64/cccccc/000000?text=P');
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setModalTitle('Error');
        setModalMessage('Failed to load profile data. Please try again.');
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, token, API_BASE_URL, logout]); // Depend on user and token for re-fetch

  const handleSave = async () => {
    if (!user || !token) {
      setModalTitle('Error');
      setModalMessage('Authentication error. Please log in again.');
      setShowModal(true);
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          location,
          skillsOffered,
          skillsWanted,
          availability,
          isPublic,
          profilePhoto
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save profile');
      }

      setModalTitle('Success');
      setModalMessage('Profile updated successfully!');
      setShowModal(true);
    } catch (error) {
      console.error('Error saving profile:', error);
      setModalTitle('Error');
      setModalMessage(error.message || 'Failed to save profile. Please try again.');
      setShowModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = async () => {
    // Re-fetch original data to discard changes
    setLoading(true); // Temporarily set loading to re-trigger fetch
    try {
        const res = await fetch(`${API_BASE_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!res.ok) {
            throw new Error('Failed to re-fetch profile for discard');
        }
        const data = await res.json();
        setName(data.name || '');
        setLocation(data.location || '');
        setSkillsOffered(data.skillsOffered || []);
        setSkillsWanted(data.skillsWanted || []);
        setAvailability(data.availability || 'Any');
        setIsPublic(data.isPublic !== undefined ? data.isPublic : true);
        setProfilePhoto(data.profilePhoto || 'https://placehold.co/64x64/cccccc/000000?text=P');
        setModalTitle('Changes Discarded');
        setModalMessage('Your changes have been discarded.');
        setShowModal(true);
    } catch (error) {
        console.error('Error discarding changes by re-fetching:', error);
        setModalTitle('Error');
        setModalMessage('Failed to discard changes. Please reload the page.');
        setShowModal(true);
    } finally {
        setLoading(false);
    }
  };

  const addSkill = (skill, type) => {
    if (skill.trim() === '') return;
    const newSkill = { name: skill.trim() }; // Store as object { name: "skill" }
    if (type === 'offered') {
      setSkillsOffered([...skillsOffered, newSkill]);
      setNewSkillOffered('');
    } else {
      setSkillsWanted([...skillsWanted, newSkill]);
      setNewSkillWanted('');
    }
  };

  const removeSkill = (index, type) => {
    if (type === 'offered') {
      setSkillsOffered(skillsOffered.filter((_, i) => i !== index));
    } else {
      setSkillsWanted(skillsWanted.filter((_, i) => i !== index));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)] text-xl text-neutral-300">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)] text-xl text-red-400">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-neutral-900 text-white font-inter">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-blue-400">Your Profile</h2>

      <div className="bg-neutral-800 p-8 rounded-xl shadow-2xl w-full max-w-3xl mx-auto border border-neutral-700">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
          <div className="flex-shrink-0">
            <img
              src={profilePhoto}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-md"
            />
            <input
              type="text"
              placeholder="Photo URL"
              className="mt-4 p-2 w-full rounded-lg bg-neutral-700 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              value={profilePhoto}
              onChange={(e) => setProfilePhoto(e.target.value)}
            />
          </div>
          <div className="flex-grow w-full">
            <div className="mb-4">
              <label htmlFor="name" className="block text-neutral-300 text-sm font-semibold mb-2">Name</label>
              <input
                type="text"
                id="name"
                className="w-full p-3 rounded-lg bg-neutral-700 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="location" className="block text-neutral-300 text-sm font-semibold mb-2">Location</label>
              <input
                type="text"
                id="location"
                className="w-full p-3 rounded-lg bg-neutral-700 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-neutral-300 text-sm font-semibold mb-2">Skills Offered</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {skillsOffered.map((skill, index) => (
              <span key={index} className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                {skill.name}
                <button onClick={() => removeSkill(index, 'offered')} className="text-white hover:text-red-300">
                  &times;
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add skill offered"
              className="flex-grow p-3 rounded-lg bg-neutral-700 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              value={newSkillOffered}
              onChange={(e) => setNewSkillOffered(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill(newSkillOffered, 'offered');
                }
              }}
            />
            <button
              onClick={() => addSkill(newSkillOffered, 'offered')}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md"
            >
              Add
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-neutral-300 text-sm font-semibold mb-2">Skills Wanted</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {skillsWanted.map((skill, index) => (
              <span key={index} className="bg-green-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                {skill.name}
                <button onClick={() => removeSkill(index, 'wanted')} className="text-white hover:text-red-300">
                  &times;
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add skill wanted"
              className="flex-grow p-3 rounded-lg bg-neutral-700 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              value={newSkillWanted}
              onChange={(e) => setNewSkillWanted(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill(newSkillWanted, 'wanted');
                }
              }}
            />
            <button
              onClick={() => addSkill(newSkillWanted, 'wanted')}
              className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition duration-200 shadow-md"
            >
              Add
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="availability" className="block text-neutral-300 text-sm font-semibold mb-2">Availability</label>
          <select
            id="availability"
            className="w-full p-3 rounded-lg bg-neutral-700 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          >
            <option value="Any">Any</option>
            <option value="Weekdays">Weekdays</option>
            <option value="Weekends">Weekends</option>
            <option value="Evenings">Evenings</option>
            <option value="Mornings">Mornings</option>
          </select>
        </div>

        <div className="mb-8 flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          <label htmlFor="isPublic" className="ml-3 text-neutral-300 text-md font-semibold">Make Profile Public</label>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={handleDiscard}
            className="bg-neutral-600 text-white px-6 py-3 rounded-lg hover:bg-neutral-700 transition duration-200 shadow-md font-semibold"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-800 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg font-semibold"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
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

export default Profile;

