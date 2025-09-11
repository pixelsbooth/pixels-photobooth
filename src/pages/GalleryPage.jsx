import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const GalleryPage = () => {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('media')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMediaItems(data || []);
      } catch (err) {
        console.error('Error fetching media:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-400 mt-10">Loading gallery...</p>;
  }

  if (mediaItems.length === 0) {
    return <p className="text-center text-gray-400 mt-10">No media found.</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-white mb-4">Gallery</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mediaItems.map((item) => (
          <div
            key={item.id}
            className="bg-gray-900 rounded-lg overflow-hidden shadow"
          >
            {item.type === 'photo' ? (
              <img
                src={item.public_url}
                alt={item.filename}
                className="w-full h-48 object-cover"
              />
            ) : (
              <video
                src={item.public_url}
                controls
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-2 text-xs text-gray-400">
              {new Date(item.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryPage;
