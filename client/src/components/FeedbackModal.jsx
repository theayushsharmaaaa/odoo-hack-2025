// src/components/FeedbackModal.jsx
import React, { useState } from 'react';

const FeedbackModal = ({ show, onClose, onSubmit, recipientName }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  if (!show) return null;

  const handleSubmit = () => {
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setError('');
    onSubmit(rating, comment);
    // Reset state after submission (or let parent handle close and reset)
    setRating(0);
    setComment('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 font-inter">
      <div className="bg-neutral-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-neutral-700 text-white">
        <h3 className="text-2xl font-bold mb-6 text-center text-blue-400">Leave Feedback for {recipientName}</h3>

        <div className="mb-4">
          <label className="block text-neutral-300 text-sm font-semibold mb-2">Rating</label>
          <div className="flex justify-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-4xl transition-colors duration-200 ${
                  star <= rating ? 'text-yellow-400' : 'text-neutral-600 hover:text-yellow-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
          {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="comment" className="block text-neutral-300 text-sm font-semibold mb-2">Comment (Optional)</label>
          <textarea
            id="comment"
            rows="4"
            className="w-full p-3 rounded-lg bg-neutral-700 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
          ></textarea>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-neutral-600 text-white px-6 py-3 rounded-lg hover:bg-neutral-700 transition duration-200 shadow-md font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-800 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg font-semibold"
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;

