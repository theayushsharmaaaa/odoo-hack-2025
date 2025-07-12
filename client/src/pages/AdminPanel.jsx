// src/pages/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';

const AdminPanel = () => {
  const { user, token, API_BASE_URL, logout } = useAuth();
  const navigate = useNavigate();

  const [allUsers, setAllUsers] = useState([]);
  const [allSwaps, setAllSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'swaps'

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalConfirmAction, setModalConfirmAction] = useState(null);
  const [showConfirmButton, setShowConfirmButton] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !token) {
        setLoading(false);
        navigate('/login'); // Redirect if not authenticated
        return;
      }
      if (!user.isAdmin) {
        setModalTitle('Access Denied');
        setModalMessage('You do not have administrative privileges.');
        setShowModal(true);
        setLoading(false);
        navigate('/'); // Redirect non-admins
        return;
      }

      try {
        // Fetch all users
        const usersRes = await fetch(`${API_BASE_URL}/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (usersRes.status === 403) { logout(); navigate('/login'); return; }
        if (!usersRes.ok) throw new Error('Failed to fetch users');
        const usersData = await usersRes.json();
        setAllUsers(usersData);

        // Fetch all swaps
        const swapsRes = await fetch(`${API_BASE_URL}/admin/swaps`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (swapsRes.status === 403) { logout(); navigate('/login'); return; }
        if (!swapsRes.ok) throw new Error('Failed to fetch swaps');
        const swapsData = await swapsRes.json();
        setAllSwaps(swapsData);

      } catch (error) {
        console.error('Error fetching admin data:', error);
        setModalTitle('Error');
        setModalMessage(error.message || 'Failed to load admin data.');
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token, API_BASE_URL, navigate, logout]);

  const handleToggleUserActive = async (userId, currentStatus) => {
    setShowConfirmButton(true);
    setModalTitle('Confirm Action');
    setModalMessage(`Are you sure you want to ${currentStatus ? 'ban' : 'unban'} this user?`);
    setModalConfirmAction(() => async () => {
      setShowModal(false); // Close modal immediately after confirm
      try {
        const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/active`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ isActive: !currentStatus })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update user status');

        setModalTitle('Success');
        setModalMessage(data.message);
        setShowConfirmButton(false);
        setShowModal(true);
        // Refresh data
        const usersRes = await fetch(`${API_BASE_URL}/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } });
        const usersData = await usersRes.json();
        setAllUsers(usersData);

      } catch (error) {
        console.error('Error toggling user status:', error);
        setModalTitle('Error');
        setModalMessage(error.message || 'Failed to update user status.');
        setShowConfirmButton(false);
        setShowModal(true);
      }
    });
    setShowModal(true);
  };

  const handleChangeSwapStatus = async (swapId, newStatus) => {
    setShowConfirmButton(true);
    setModalTitle('Confirm Action');
    setModalMessage(`Are you sure you want to change this swap status to "${newStatus}"?`);
    setModalConfirmAction(() => async () => {
      setShowModal(false); // Close modal immediately after confirm
      try {
        const res = await fetch(`${API_BASE_URL}/admin/swaps/${swapId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update swap status');

        setModalTitle('Success');
        setModalMessage(data.message);
        setShowConfirmButton(false);
        setShowModal(true);
        // Refresh data
        const swapsRes = await fetch(`${API_BASE_URL}/admin/swaps`, { headers: { 'Authorization': `Bearer ${token}` } });
        const swapsData = await swapsRes.json();
        setAllSwaps(swapsData);

      } catch (error) {
        console.error('Error changing swap status:', error);
        setModalTitle('Error');
        setModalMessage(error.message || 'Failed to change swap status.');
        setShowConfirmButton(false);
        setShowModal(true);
      }
    });
    setShowModal(true);
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)] text-xl text-neutral-300">
        Loading Admin Panel...
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)] text-xl text-red-400">
        Access Denied: You must be an administrator to view this page.
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-neutral-900 text-white font-inter">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-red-400">Admin Panel</h2>

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 rounded-lg font-semibold transition duration-200 ${
            activeTab === 'users' ? 'bg-red-600 text-white shadow-lg' : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
        >
          Manage Users
        </button>
        <button
          onClick={() => setActiveTab('swaps')}
          className={`px-6 py-3 rounded-lg font-semibold transition duration-200 ${
            activeTab === 'swaps' ? 'bg-red-600 text-white shadow-lg' : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
        >
          Manage Swaps
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-neutral-800 p-8 rounded-xl shadow-2xl w-full max-w-4xl mx-auto border border-neutral-700">
          <h3 className="text-3xl font-bold mb-6 text-red-300">All Users</h3>
          {allUsers.length === 0 ? (
            <p className="text-neutral-400">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-700">
                <thead className="bg-neutral-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Public</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Admin</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700">
                  {allUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{u.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.isPublic ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {u.isPublic ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.isAdmin ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                          {u.isAdmin ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {u.isActive ? 'Active' : 'Banned'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleToggleUserActive(u.id, u.isActive)}
                          className={`px-4 py-2 rounded-lg text-white font-semibold ${u.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} transition duration-200`}
                          disabled={u.id === user.id} // Prevent admin from banning themselves
                        >
                          {u.isActive ? 'Ban' : 'Unban'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'swaps' && (
        <div className="bg-neutral-800 p-8 rounded-xl shadow-2xl w-full max-w-4xl mx-auto border border-neutral-700">
          <h3 className="text-3xl font-bold mb-6 text-red-300">All Swap Requests</h3>
          {allSwaps.length === 0 ? (
            <p className="text-neutral-400">No swap requests found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-700">
                <thead className="bg-neutral-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">From</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">To</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Offered Skill</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Wanted Skill</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700">
                  {allSwaps.map((s) => (
                    <tr key={s.id} className="hover:bg-neutral-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{s.fromUserName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{s.toUserName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{s.offeredSkill?.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{s.wantedSkill?.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          s.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          s.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          s.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2">
                        {s.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleChangeSwapStatus(s.id, 'accepted')}
                              className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition duration-200"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleChangeSwapStatus(s.id, 'rejected')}
                              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition duration-200"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {s.status === 'accepted' && (
                          <button
                            onClick={() => handleChangeSwapStatus(s.id, 'completed')}
                            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition duration-200"
                          >
                            Mark Completed
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Modal
        show={showModal}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setShowModal(false)}
        onConfirm={modalConfirmAction}
        showConfirmButton={showConfirmButton}
      />
    </div>
  );
};

export default AdminPanel;

