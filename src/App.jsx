import React, { useState } from 'react';
import BoothPage from './pages/BoothPage';
import SharePage from './pages/SharePage';
import SetupWizard from './pages/SetupWizard';

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

  const handleNavigateToSetup = () => {
    setCurrentPage('setup');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'booth':
        return (
          <BoothPage 
            onNavigateToShare={handleNavigateToShare}
            onNavigateToSetup={handleNavigateToSetup}
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
      case 'setup':
        return (
          <SetupWizard 
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