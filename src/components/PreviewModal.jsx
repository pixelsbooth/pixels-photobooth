import React from 'react';
import { X, RotateCcw, Share2 } from 'lucide-react';

const PreviewModal = ({ image, onRetake, onShare, isUploading }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Preview</h2>
            <button
              onClick={onRetake}
              className="text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="p-4">
            <img
              src={image}
              alt="Captured preview"
              className="w-full rounded-lg"
            />
          </div>
          
          <div className="p-4 border-t border-gray-700 flex gap-4">
            <button
              onClick={onRetake}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              <RotateCcw size={20} />
              Retake
            </button>
            <button
              onClick={onShare}
              disabled={isUploading}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
            >
              <Share2 size={20} />
              {isUploading ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;