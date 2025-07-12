// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard';
import Modal from '../components/Modal';

const Home = () => {
  const { user, token, API_BASE_URL } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userActiveSwaps, setUserActiveSwaps] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(6);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalConfirmAction, setModalConfirmAction] = useState(null);
  const [showConfirmButton, setShowConfirmButton] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch all public users
        const usersRes = await fetch(`${API_BASE_URL}/users`);
        if (!usersRes.ok) {
          throw new Error('Failed to fetch users');
        }
        const usersData = await usersRes.json();

        // NEW: Fetch current user's swap requests if logged in
        let activeSwaps = [];
        if (user && token) {
          const swapsRes = await fetch(`${API_BASE_URL}/swaps/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (swapsRes.ok) {
            const swapsData = await swapsRes.json();
            // Filter for pending or accepted swaps
            activeSwaps = swapsData.filter(s => s.status === 'pending' || s.status === 'accepted');
            setUserActiveSwaps(activeSwaps);
          } else {
            console.error('Failed to fetch user swaps for Home page:', swapsRes.statusText);
          }
        } else {
          setUserActiveSwaps([]);
        }

        // Filter out the current user if logged in, ensure they are active,
        // AND filter out users with whom there's an active swap
        const filteredPublicUsers = usersData.filter(u => {
          const isCurrentUser = user ? u.id === user.id : false;
          const hasActiveSwapWithUser = activeSwaps.some(
            swap => (swap.fromUserId === user?.id && swap.toUserId === u.id) ||
                    (swap.fromUserId === u.id && swap.toUserId === user?.id)
          );
          return u.isActive && !isCurrentUser && !hasActiveSwapWithUser;
        });

        setUsers(filteredPublicUsers);
        setFilteredUsers(filteredPublicUsers);

      } catch (err) {
        console.error('Error loading initial data for Home page:', err);
        setModalTitle('Error');
        setModalMessage('Failed to load data. Please try again later.');
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [user, token, API_BASE_URL]); // Depend on user and token to re-fetch on login/logout

  useEffect(() => {
    let result = users;

    // Apply search filter (skills offered/wanted)
    if (searchQuery) {
      result = result.filter(u =>
        u.skillsOffered?.some(skill =>
          skill.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        u.skillsWanted?.some(skill =>
          skill.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply availability filter
    if (availabilityFilter) {
      result = result.filter(u =>
        u.availability?.toLowerCase() === availabilityFilter.toLowerCase()
      );
    }

    setFilteredUsers(result);
    setCurrentPage(1); // Reset to first page on filter/search change
  }, [searchQuery, availabilityFilter, users]);

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleRequestSwapClick = (toUserId) => {
    if (!user) {
      setModalTitle('Login Required');
      setModalMessage('Please log in to send a swap request.');
      setShowConfirmButton(true);
      setModalConfirmAction(() => () => {
        setShowModal(false);
        navigate('/login');
      });
      setShowModal(true);
      return;
    }
    navigate(`/swap-request/${toUserId}`);
  };

  return (
    <div className="p-6 min-h-screen bg-neutral-900 text-white font-inter">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-400">Skill Swap Platform</h1>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Search skills (e.g., Python, Design)..."
          className="border border-neutral-700 bg-neutral-800 text-white rounded-lg p-3 w-full sm:w-1/2 lg:w-1/3 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <select
          value={availabilityFilter}
          onChange={e => setAvailabilityFilter(e.target.value)}
          className="border border-neutral-700 bg-neutral-800 text-white rounded-lg p-3 w-full sm:w-1/2 lg:w-1/4 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
        >
          <option value="">All Availability</option>
          <option value="Weekends">Weekends</option>
          <option value="Weekdays">Weekdays</option>
          <option value="Evenings">Evenings</option>
          <option value="Mornings">Mornings</option>
          <option value="Any">Any</option>
        </select>
      </div>

      {filteredUsers.length === 0 ? (
        <p className="text-center text-neutral-400 text-xl mt-12">No users match your search or filters or have active swaps.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentUsers.map(u => (
              <ProfileCard
                key={u.id}
                user={u}
                // The button will now always be shown if the user is logged in and not self,
                // as users with active swaps are filtered out earlier.
                showRequestButton={!!user && user.id !== u.id}
                onRequest={() => handleRequestSwapClick(u.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-10 space-x-2">
              {[...Array(totalPages).keys()].map(number => (
                <button
                  key={number + 1}
                  onClick={() => paginate(number + 1)}
                  className={`px-4 py-2 rounded-lg font-semibold transition duration-200 ${
                    currentPage === number + 1
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                  }`}
                >
                  {number + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal for messages */}
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

export default Home;

