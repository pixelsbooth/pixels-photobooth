import React, { useState, useEffect } from 'react';
import BoothPage from './pages/BoothPage';
import SharePage from './pages/SharePage';
import SetupWizard from './pages/SetupWizard';
import GalleryPage from './pages/GalleryPage';
import { supabase } from './lib/supabaseClient';

const App = () => {
  const [currentPage, setCurrentPage] = useState('booth');
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [sharedUrl, setSharedUrl] = useState('');
  const [mediaType, setMediaType] = useState('photo'); // 'photo', 'video', 'gif', 'boomerang'
  const [currentEventId, setCurrentEventId] = useState(null);
  const [currentEventDetails, setCurrentEventDetails] = useState(null); // Stores name, logo_url etc.

  useEffect(() => {
    // Fetch the latest event ID and details on app load
    const fetchLatestEvent = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('id, name, logo_url, theme_color, watermark_url, gallery_public')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
          throw error;
        }

        if (data) {
          setCurrentEventId(data.id);
          setCurrentEventDetails(data);
        } else {
          // If no event exists, navigate to setup wizard
          setCurrentPage('setup');
        }
      } catch (error) {
        console.error('Error fetching latest event:', error);
        // Optionally, navigate to an error page or setup
        setCurrentPage('setup');
      }
    };

    fetchLatestEvent();
  }, []);

  const handleNavigateToShare = (photoData, url, type = 'photo') => {
    setCapturedPhoto(photoData);
    setSharedUrl(url);
    setMediaType(type);
    setCurrentPage('share');
  };

  const handleReturnToBooth = () => {
    setCapturedPhoto(null);
    setSharedUrl('');
    setMediaType('photo');
    setCurrentPage('booth');
  };

  const handleNavigateToSetup = () => {
    setCurrentPage('setup');
  };

  const handleNavigateToGallery = () => {
    setCurrentPage('gallery');
  };

  const handleEventSaved = (eventId, eventDetails) => {
    setCurrentEventId(eventId);
    setCurrentEventDetails(eventDetails);
    setCurrentPage('booth'); // Go back to booth after setup
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'booth':
        return (
          <BoothPage
            onNavigateToShare={handleNavigateToShare}
            onNavigateToSetup={handleNavigateToSetup}
            onNavigateToGallery={handleNavigateToGallery}
            eventId={currentEventId}
            eventDetails={currentEventDetails}
          />
        );
      case 'share':
        return (
          <SharePage
            capturedPhoto={capturedPhoto}
            sharedUrl={sharedUrl}
            onReturnToBooth={handleReturnToBooth}
            mediaType={mediaType}
          />
        );
      case 'setup':
        return (
          <SetupWizard
            onReturnToBooth={handleReturnToBooth}
            onEventSaved={handleEventSaved}
          />
        );
      case 'gallery':
        // Only show gallery if an event is selected
        if (currentEventId) {
          return <GalleryPage eventId={currentEventId} />;
        } else {
          return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
              <p className="text-xl mb-4">No event selected for gallery.</p>
              <button
                onClick={handleNavigateToSetup}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Go to Setup
              </button>
            </div>
          );
        }
      default:
        return <BoothPage onNavigateToShare={handleNavigateToShare} onNavigateToSetup={handleNavigateToSetup} />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {renderCurrentPage()}
    </div>
  );
};

export default App;