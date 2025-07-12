// src/components/ProfileCard.jsx
import React from 'react';

// This component displays a user's profile information in a card format.
// It includes an optional "Request Swap" button.
const ProfileCard = ({ user, showRequestButton, onRequest }) => {
  // Destructure user properties with default empty arrays for skills
  const {
    id,
    name,
    profilePhoto,
    location,
    skillsOffered = [],
    skillsWanted = [],
    availability,
    rating,
    reviews,
    isPublic,
    isActive // Added isActive to check if user is active
  } = user;

  // Do not render the card if the user is not active (banned by admin)
  if (!isActive) {
    return null;
  }

  return (
    <div className="bg-neutral-800 p-6 rounded-xl shadow-lg border border-neutral-700 flex flex-col items-center text-center transform transition duration-300 hover:scale-105 hover:shadow-2xl">
      <img
        src={profilePhoto || 'https://placehold.co/128x128/cccccc/000000?text=P'}
        alt={`${name}'s profile`}
        className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-blue-500 shadow-md"
      />
      <h3 className="text-2xl font-bold text-blue-300 mb-2">{name}</h3>
      {location && <p className="text-neutral-400 text-sm mb-2">{location}</p>}

      {/* Display User ID for debugging/identification in multi-user apps */}
      <p className="text-xs text-neutral-500 mb-4">ID: {id}</p>

      <div className="mb-4 w-full">
        <p className="text-neutral-300 font-semibold mb-1">Skills Offered:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {skillsOffered.length > 0 ? (
            skillsOffered.map((skill, index) => (
              <span key={index} className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow-sm">
                {skill.name}
              </span>
            ))
          ) : (
            <span className="text-neutral-500 text-xs">None listed</span>
          )}
        </div>
      </div>

      <div className="mb-4 w-full">
        <p className="text-neutral-300 font-semibold mb-1">Skills Wanted:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {skillsWanted.length > 0 ? (
            skillsWanted.map((skill, index) => (
              <span key={index} className="bg-green-600 text-white text-xs px-3 py-1 rounded-full shadow-sm">
                {skill.name}
              </span>
            ))
          ) : (
            <span className="text-neutral-500 text-xs">None listed</span>
          )}
        </div>
      </div>

      {availability && (
        <p className="text-neutral-400 text-sm mb-4">
          <span className="font-semibold">Availability:</span> {availability}
        </p>
      )}

      <div className="flex items-center text-yellow-400 text-sm mb-4">
        <span className="mr-1">⭐</span>
        {rating !== undefined && rating !== null ? rating.toFixed(1) : 'N/A'} ({reviews} reviews)
      </div>

      {/* Conditionally render the button based on showRequestButton prop */}
      {showRequestButton && (
        <button
          onClick={onRequest}
          className="mt-auto bg-gradient-to-r from-purple-500 to-purple-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-800 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
        >
          Request Swap
        </button>
      )}
      {!showRequestButton && user.id !== id && ( // Display message if button is hidden due to active swap
        <p className="mt-auto text-neutral-400 text-sm italic">
          Active swap in progress.
        </p>
      )}
    </div>
  );
};

export default ProfileCard;

