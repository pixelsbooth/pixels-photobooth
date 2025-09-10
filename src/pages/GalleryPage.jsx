import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Share2, Calendar, Users, Image, Video, Zap } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import QRCodeDisplay from '../components/QRCodeDisplay';

const GalleryPage = ({ eventId, onReturnToBooth }) => {
  const [event, setEvent] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (eventId) {
      fetchEventData();
      fetchMediaData();
    }
  }, [eventId, filter, sortBy]);

  const fetchEventData = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  };

  const fetchMediaData = async () => {
    try {
      let query = supabase
        .from('media')
        .select('*')
        .eq('event_id', eventId);

      if (filter !== 'all') {
        query = query.eq('type', filter);
      }

      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: true });
      }

      const { data, error } = await query;

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (mediaItem) => {
    try {
      const response = await fetch(mediaItem.public_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = mediaItem.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading media:', error);
    }
  };

  const getMediaIcon = (type) => {
    switch (type) {
      case 'video':
      case 'boomerang':
        return <Video size={16} />;
      case 'gif':
        return <Zap size={16} />;
      default:
        return <Image size={16} />;
    }
  };

  const getFilteredCount = (type) => {
    return media.filter(item => type === 'all' || item.type === type).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="text-gray-400">The requested event gallery could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="p-4 border-b border-gray-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {onReturnToBooth && (
            <button
              onClick={onReturnToBooth}
              className="flex items-center text-gray-400 hover:text-white"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Booth
            </button>
          )}
          
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold" style={{ color: event.theme_color }}>
              {event.name} Gallery
            </h1>
            <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(event.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Users size={14} />
                {media.length} captures
              </div>
            </div>
          </div>

          <div className="w-24"></div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Filter:</span>
            {[
              { key: 'all', label: 'All', count: media.length },
              { key: 'photo', label: 'Photos', count: getFilteredCount('photo') },
              { key: 'video', label: 'Videos', count: getFilteredCount('video') },
              { key: 'gif', label: 'GIFs', count: getFilteredCount('gif') },
              { key: 'boomerang', label: 'Boomerangs', count: getFilteredCount('boomerang') }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Media Grid */}
        {media.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Image size={48} className="mx-auto mb-2" />
              <p>No media found for this event yet.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {media.map((item) => (
              <div
                key={item.id}
                className="relative group cursor-pointer bg-gray-900 rounded-lg overflow-hidden aspect-square"
                onClick={() => setSelectedMedia(item)}
              >
                {item.type === 'video' || item.type === 'boomerang' ? (
                  <video
                    src={item.public_url}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    onMouseEnter={(e) => e.target.play()}
                    onMouseLeave={(e) => e.target.pause()}
                  />
                ) : (
                  <img
                    src={item.public_url}
                    alt="Gallery item"
                    className="w-full h-full object-cover"
                    style={item.filters ? { filter: generateFilterCSS(item.filters) } : {}}
                  />
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(item);
                        }}
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-colors"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.share?.({ url: item.public_url });
                        }}
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-colors"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Media Type Badge */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  {getMediaIcon(item.type)}
                  {item.type.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Share Gallery */}
        <div className="mt-12 text-center">
          <h2 className="text-xl font-bold mb-4">Share This Gallery</h2>
          <div className="max-w-sm mx-auto">
            <QRCodeDisplay url={window.location.href} />
            <p className="text-gray-400 mt-4 text-sm">
              Scan to share this gallery with others
            </p>
          </div>
        </div>
      </div>

      {/* Media Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full">
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  {selectedMedia.type.charAt(0).toUpperCase() + selectedMedia.type.slice(1)}
                </h3>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
              
              <div className="p-4">
                {selectedMedia.type === 'video' || selectedMedia.type === 'boomerang' ? (
                  <video
                    src={selectedMedia.public_url}
                    controls
                    autoPlay
                    loop={selectedMedia.type === 'boomerang'}
                    className="w-full rounded-lg"
                  />
                ) : (
                  <img
                    src={selectedMedia.public_url}
                    alt="Selected media"
                    className="w-full rounded-lg"
                    style={selectedMedia.filters ? { filter: generateFilterCSS(selectedMedia.filters) } : {}}
                  />
                )}
              </div>
              
              <div className="p-4 border-t border-gray-700 flex gap-4">
                <button
                  onClick={() => handleDownload(selectedMedia)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download
                </button>
                <button
                  onClick={() => navigator.share?.({ url: selectedMedia.public_url })}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 size={20} />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to generate CSS filter string
const generateFilterCSS = (filters) => {
  if (!filters) return '';
  
  const filterParts = [];
  if (filters.brightness !== undefined) filterParts.push(`brightness(${filters.brightness}%)`);
  if (filters.contrast !== undefined) filterParts.push(`contrast(${filters.contrast}%)`);
  if (filters.saturation !== undefined) filterParts.push(`saturate(${filters.saturation}%)`);
  if (filters.sepia !== undefined) filterParts.push(`sepia(${filters.sepia}%)`);
  if (filters.grayscale !== undefined) filterParts.push(`grayscale(${filters.grayscale}%)`);
  if (filters.blur !== undefined) filterParts.push(`blur(${filters.blur}px)`);
  
  return filterParts.join(' ');
};

export default GalleryPage;