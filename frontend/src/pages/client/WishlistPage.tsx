import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface WishlistEvent {
  id: string;
  name: string;
  image: string;
  date: string;
  location: string;
  price: number;
  category: string;
}

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<WishlistEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch wishlist from API
    // const fetchWishlist = async () => {
    //   try {
    //     const response = await fetch('/api/wishlist');
    //     const data = await response.json();
    //     setWishlist(data);
    //   } catch (error) {
    //     console.error('Error fetching wishlist:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchWishlist();

    // Mock data
    setWishlist([
      {
        id: '1',
        name: 'Concert A',
        image: 'https://via.placeholder.com/300x400',
        date: '2024-03-15',
        location: 'Ho Chi Minh City',
        price: 500000,
        category: 'Music',
      },
    ]);
    setLoading(false);
  }, []);

  const handleRemoveFromWishlist = (id: string) => {
    setWishlist(wishlist.filter(item => item.id !== id));
    // TODO: Call API to remove from wishlist
  };

  const handleViewEvent = (id: string) => {
    navigate(`/event/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8655f6]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Wishlist</h1>
        <p className="text-gray-400">Your saved events for later</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">favorite</span>
          <h2 className="text-xl font-semibold text-gray-400 mb-2">No events in your wishlist</h2>
          <p className="text-gray-500 mb-6">Start adding events you're interested in!</p>
          <button
            onClick={() => navigate('/search')}
            className="px-6 py-2 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg transition-colors"
          >
            Explore Events
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map(event => (
            <div
              key={event.id}
              className="bg-[#2a2436] rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="relative overflow-hidden h-48">
                <img
                  src={event.image}
                  alt={event.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
                <button
                  onClick={() => handleRemoveFromWishlist(event.id)}
                  className="absolute top-3 right-3 bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md p-2 rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-red-400 text-xl">close</span>
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold text-lg mb-1 truncate">{event.name}</h3>
                <div className="flex items-center gap-1 text-gray-400 text-sm mb-2">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {event.location}
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-sm mb-4">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-white font-bold">{event.price.toLocaleString()} đ</div>
                  <button
                    onClick={() => handleViewEvent(event.id)}
                    className="px-4 py-2 bg-[#8655f6] hover:bg-[#7644e0] text-white rounded-lg text-sm transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
