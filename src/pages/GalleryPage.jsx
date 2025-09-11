import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import MediaCard from "../components/MediaCard";

const GalleryPage = () => {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("media")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setMediaItems(data || []);
      } catch (err) {
        console.error("Error fetching media:", err);
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
          <MediaCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default GalleryPage;
