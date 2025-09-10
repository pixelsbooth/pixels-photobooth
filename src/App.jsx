import React, { useState } from 'react';
import BoothPage from './pages/BoothPage';
import SharePage from './pages/SharePage';
import AdminUpload from './pages/AdminUpload';

const App = () => {
  const [currentPage, setCurrentPage] = useState('booth');
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [sharedUrl, setSharedUrl] = useState('');

  const handleNavigateToShare = (photoData, url) => {
    setCapturedPhoto(photoData);
    setSharedUrl(url);
    setCurrentPage('share');
  };

  const handleReturnToBooth = () => {
    setCapturedPhoto(null);
    setSharedUrl('');
    setCurrentPage('booth');
  };

  const handleNavigateToAdmin = () => {
    setCurrentPage('admin');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'booth':
        return (
          <BoothPage 
            onNavigateToShare={handleNavigateToShare}
            onNavigateToAdmin={handleNavigateToAdmin}
          />
        );
      case 'share':
        return (
          <SharePage 
            capturedPhoto={capturedPhoto}
            sharedUrl={sharedUrl}
            onReturnToBooth={handleReturnToBooth}
          />
        );
      case 'admin':
        return (
          <AdminUpload 
            onReturnToBooth={handleReturnToBooth}
          />
        );
      default:
        return <BoothPage onNavigateToShare={handleNavigateToShare} />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {renderCurrentPage()}
    </div>
  );
};

export default App;