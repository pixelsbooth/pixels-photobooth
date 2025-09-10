import React from 'react';
import { ArrowLeft } from 'lucide-react';
import QRCodeDisplay from '../components/QRCodeDisplay';

const SharePage = ({ capturedPhoto, sharedUrl, onReturnToBooth }) => {
  return (
    <div className="min-h-screen bg-black text-white p-4">
      <header className="flex items-center justify-between mb-6">
        <button
          onClick={onReturnToBooth}
          className="flex items-center text-gray-400 hover:text-white"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Booth
        </button>
        <h1 className="text-xl font-bold">Share Your Photo</h1>
        <div></div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 items-center justify-center max-w-6xl mx-auto">
        <div className="flex-1 max-w-md">
          <img
            src={capturedPhoto}
            alt="Captured photo"
            className="rounded-lg w-full shadow-lg"
          />
        </div>

        <div className="flex-1 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Scan to Download</h2>
          <QRCodeDisplay url={sharedUrl} />
          <p className="text-gray-400 mt-4 text-sm">
            Scan this QR code with your phone to download your photo
          </p>
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-300 break-all">
              {sharedUrl}
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <button
          onClick={onReturnToBooth}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
        >
          Take Another Photo
        </button>
      </div>
    </div>
  );
};

export default SharePage;