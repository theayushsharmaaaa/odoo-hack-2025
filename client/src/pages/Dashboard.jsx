// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal'; // For general messages
import FeedbackModal from '../components/FeedbackModal'; // NEW: For feedback submission

const Dashboard = () => {
  const { user, token, API_BASE_URL, logout } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'accepted', 'rejected', 'completed'
  const [isSaving, setIsSaving] = useState(false);

  // Feedback Modal State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedSwapForFeedback, setSelectedSwapForFeedback] = useState(null);

  // General Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalConfirmAction, setModalConfirmAction] = useState(null);
  const [showConfirmButton, setShowConfirmButton] = useState(false);


  const fetchUserRequests = async () => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/swaps/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 403) {
          logout();
          setModalTitle('Session Expired');
          setModalMessage('Your session has expired. Please log in again.');
          setShowModal(true);
          setLoading(false);
          return;
      }

      if (!res.ok) {
        throw new Error('Failed to fetch swap requests');
      }

      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching swap requests:", error);
      setModalTitle('Error');
      setModalMessage('Failed to load swap requests. Please try again.');
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRequests();
  }, [user, token, API_BASE_URL, logout]);

  const handleStatusUpdate = async (requestId, newStatus) => {
    if (!user || !token) {
      setModalTitle('Error');
      setModalMessage('Authentication error. Please log in again.');
      setShowModal(true);
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/swaps/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Failed to update status to ${newStatus}`);
      }

      setModalTitle('Success');
      setModalMessage(`Request ${newStatus} successfully!`);
      setShowModal(true);
      fetchUserRequests(); // Re-fetch requests to update UI
    } catch (error) {
      console.error(`Error updating request status to ${newStatus}:`, error);
      setModalTitle('Error');
      setModalMessage(error.message || `Failed to ${newStatus} request.`);
      setShowModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    setShowConfirmButton(true);
    setModalTitle('Confirm Deletion');
    setModalMessage('Are you sure you want to delete this pending swap request?');
    setModalConfirmAction(() => async () => {
      setShowModal(false); // Close confirmation modal
      try {
        const res = await fetch(`${API_BASE_URL}/swaps/${requestId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to delete request');

        setModalTitle('Success');
        setModalMessage('Swap request deleted successfully!');
        setShowConfirmButton(false);
        setShowModal(true);
        fetchUserRequests(); // Re-fetch requests
      } catch (error) {
        console.error('Error deleting request:', error);
        setModalTitle('Error');
        setModalMessage(error.message || 'Failed to delete request.');
        setShowConfirmButton(false);
        setShowModal(true);
      }
    });
    setShowModal(true);
  };

  // NEW: Handle opening feedback modal
  const handleOpenFeedbackModal = (swapRequest) => {
    setSelectedSwapForFeedback(swapRequest);
    setShowFeedbackModal(true);
  };

  // NEW: Handle feedback submission
  const handleSubmitFeedback = async (rating, comment) => {
    if (!selectedSwapForFeedback) return;

    const recipientUserId = selectedSwapForFeedback.fromUserId === user.id ? selectedSwapForFeedback.toUserId : selectedSwapForFeedback.fromUserId;
    const recipientName = selectedSwapForFeedback.fromUserId === user.id ? selectedSwapForFeedback.toUserName : selectedSwapForFeedback.fromUserName;

    try {
      const res = await fetch(`${API_BASE_URL}/users/${recipientUserId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          swapRequestId: selectedSwapForFeedback.id,
          rating,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit feedback.');
      }

      // After successful feedback, mark the swap as 'completed'
      await handleStatusUpdate(selectedSwapForFeedback.id, 'completed');

      setModalTitle('Feedback Submitted');
      setModalMessage(`Thank you for your feedback for ${recipientName}!`);
      setShowModal(true);
      setShowFeedbackModal(false); // Close feedback modal
      setSelectedSwapForFeedback(null); // Clear selected swap
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setModalTitle('Feedback Error');
      setModalMessage(error.message || 'Failed to submit feedback. Please try again.');
      setShowModal(true);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filterStatus === 'all') return true;
    return req.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)] text-xl text-neutral-300">
        Loading swap requests...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)] text-xl text-red-400">
        Please log in to view your swap requests.
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-neutral-900 text-white font-inter">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-blue-400">Your Swap Requests</h2>

      <div className="flex justify-center gap-4 mb-8">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-neutral-700 bg-neutral-800 text-white rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option> {/* NEW Filter Option */}
        </select>
      </div>

      {filteredRequests.length === 0 ? (
        <p className="text-center text-neutral-400 text-xl mt-12">No requests found with the selected filter.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRequests.map(req => {
            const isIncoming = req.toUserId === user.id;
            const isOutgoing = req.fromUserId === user.id;
            const recipientOfFeedback = isIncoming ? req.fromUserName : req.toUserName; // Who receives the feedback

            return (
              <div key={req.id} className="bg-neutral-800 p-6 rounded-xl shadow-lg border border-neutral-700 flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={isIncoming ? req.fromUserProfilePhoto : req.toUserProfilePhoto}
                    alt="User Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                  />
                  <div>
                    <p className="text-xl font-bold text-blue-300">
                      {isIncoming ? `Request from ${req.fromUserName}` : `Request to ${req.toUserName}`}
                    </p>
                    <p className={`text-sm font-semibold ${
                      req.status === 'pending' ? 'text-yellow-400' :
                      req.status === 'accepted' ? 'text-green-400' :
                      req.status === 'rejected' ? 'text-red-400' :
                      'text-neutral-400' // For 'completed'
                    }`}>
                      Status: {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-neutral-300">
                    <strong>Offering:</strong> {req.offeredSkill?.name || 'N/A'} (by {req.fromUserName})
                  </p>
                  <p className="text-sm text-neutral-300">
                    <strong>Requesting:</strong> {req.wantedSkill?.name || 'N/A'} (from {req.toUserName})
                  </p>
                  {req.message && (
                    <p className="text-sm text-neutral-400 italic mt-2">"{req.message}"</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-auto pt-4 border-t border-neutral-700">
                  {req.status === 'pending' && isIncoming && ( // Incoming pending requests
                    <>
                      <button
                        onClick={() => handleStatusUpdate(req.id, 'accepted')}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 shadow-md font-semibold"
                        disabled={isSaving}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(req.id, 'rejected')}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200 shadow-md font-semibold"
                        disabled={isSaving}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {req.status === 'pending' && isOutgoing && ( // Outgoing pending requests
                    <button
                      onClick={() => handleDeleteRequest(req.id)}
                      className="flex-1 bg-neutral-600 text-white px-4 py-2 rounded-lg hover:bg-neutral-700 transition duration-200 shadow-md font-semibold"
                      disabled={isSaving}
                    >
                      Cancel Request
                    </button>
                  )}
                  {req.status === 'accepted' && ( // Accepted requests: option to leave feedback
                    <button
                      onClick={() => handleOpenFeedbackModal(req)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md font-semibold"
                      disabled={isSaving}
                    >
                      Leave Feedback
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* General Modal */}
      <Modal
        show={showModal}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setShowModal(false)}
        onConfirm={modalConfirmAction}
        showConfirmButton={showConfirmButton}
      />

      {/* Feedback Modal */}
      {selectedSwapForFeedback && (
        <FeedbackModal
          show={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={handleSubmitFeedback}
          recipientName={selectedSwapForFeedback.fromUserId === user.id ? selectedSwapForFeedback.toUserName : selectedSwapForFeedback.fromUserName}
        />
      )}
    </div>
  );
};

export default Dashboard;

