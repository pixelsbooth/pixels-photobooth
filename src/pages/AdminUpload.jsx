import React, { useState } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const AdminUpload = ({ onReturnToBooth }) => {
  const [logoFile, setLogoFile] = useState(null);
  const [eventName, setEventName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
    }
  };

  const handleUpload = async () => {
    if (!logoFile || !eventName.trim()) {
      setUploadStatus('Please provide both event name and logo file');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Uploading...');

    try {
      // Upload logo to Supabase storage
      const fileName = `logo-${Date.now()}-${logoFile.name}`;
      const { data, error } = await supabase.storage
        .from('assets')
        .upload(fileName, logoFile);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('assets')
        .getPublicUrl(fileName);

      // Save event to database
      await supabase.from('events').insert({
        name: eventName,
        logo_url: urlData.publicUrl,
        created_at: new Date().toISOString()
      });

      setUploadStatus('Upload successful!');
      setEventName('');
      setLogoFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('logo-upload');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Error uploading:', error);
      setUploadStatus('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <header className="flex items-center justify-between mb-8">
        <button
          onClick={onReturnToBooth}
          className="flex items-center text-gray-400 hover:text-white"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Booth
        </button>
        <h1 className="text-2xl font-bold">Admin Upload</h1>
        <div></div>
      </header>

      <div className="max-w-md mx-auto">
        <div className="space-y-6">
          <div>
            <label htmlFor="event-name" className="block text-sm font-medium mb-2">
              Event Name
            </label>
            <input
              id="event-name"
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter event name"
            />
          </div>

          <div>
            <label htmlFor="logo-upload" className="block text-sm font-medium mb-2">
              Logo Upload
            </label>
            <label htmlFor="logo-upload" className="cursor-pointer">
              <div className="w-full h-32 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center hover:border-gray-500 transition-colors">
                <Upload size={24} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-400">
                  {logoFile ? logoFile.name : 'Click to upload logo'}
                </span>
              </div>
            </label>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={isUploading || !logoFile || !eventName.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            {isUploading ? 'Uploading...' : 'Upload Event Assets'}
          </button>

          {uploadStatus && (
            <p className={`text-sm text-center ${
              uploadStatus.includes('successful') ? 'text-green-400' : 
              uploadStatus.includes('failed') ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {uploadStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUpload;