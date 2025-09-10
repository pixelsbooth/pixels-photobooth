import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const SetupWizard = ({ onReturnToBooth }) => {
  const [eventName, setEventName] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [sharingOptions, setSharingOptions] = useState({
    qr: true,
    email: false,
    sms: false,
    print: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [currentEventId, setCurrentEventId] = useState(null);

  useEffect(() => {
    const fetchLatestEvent = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          const latestEvent = data[0];
          setCurrentEventId(latestEvent.id);
          setEventName(latestEvent.name || '');
          setSharingOptions(latestEvent.sharing_options || { qr: true, email: false, sms: false, print: false });
        }
      } catch (error) {
        console.error('Error fetching latest event:', error);
        setSaveStatus('Failed to load previous event settings.');
      }
    };
    fetchLatestEvent();
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
    } else {
      setLogoFile(null);
      setSaveStatus('Please select an image file for the logo.');
    }
  };

  const handleSharingOptionChange = (option) => {
    setSharingOptions((prevOptions) => ({
      ...prevOptions,
      [option]: !prevOptions[option],
    }));
  };

  const handleSave = async () => {
    if (!eventName.trim()) {
      setSaveStatus('Please enter an event name.');
      return;
    }

    setIsSaving(true);
    setSaveStatus('Saving event configuration...');

    let logoUrl = null;
    if (logoFile) {
      try {
        const fileName = `logo-${Date.now()}-${logoFile.name}`;
        const { data, error } = await supabase.storage
          .from('assets')
          .upload(fileName, logoFile);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('assets')
          .getPublicUrl(fileName);
        logoUrl = urlData.publicUrl;
      } catch (error) {
        console.error('Error uploading logo:', error);
        setSaveStatus('Logo upload failed. Please try again.');
        setIsSaving(false);
        return;
      }
    }

    try {
      const eventData = {
        name: eventName,
        sharing_options: sharingOptions,
        created_at: new Date().toISOString(),
      };

      if (logoUrl) {
        eventData.logo_url = logoUrl;
      }

      let result;
      if (currentEventId) {
        result = await supabase
          .from('events')
          .update(eventData)
          .eq('id', currentEventId);
      } else {
        result = await supabase
          .from('events')
          .insert(eventData);
      }

      if (result.error) throw result.error;

      setSaveStatus('Event configuration saved successfully!');
      setLogoFile(null);
      const fileInput = document.getElementById('logo-upload');
      if (fileInput) fileInput.value = '';
      
      if (!currentEventId) {
        const { data: newEventData } = await supabase
          .from('events')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(1);
        if (newEventData && newEventData.length > 0) {
          setCurrentEventId(newEventData[0].id);
        }
      }

    } catch (error) {
      console.error('Error saving event configuration:', error);
      setSaveStatus('Failed to save event configuration.');
    } finally {
      setIsSaving(false);
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
        <h1 className="text-2xl font-bold">Setup Wizard</h1>
        <div></div>
      </header>

      <div className="max-w-md mx-auto space-y-6">
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
            Logo Upload (Optional)
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

        <div>
          <h2 className="text-lg font-medium mb-3">Sharing Options</h2>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={sharingOptions.qr}
                disabled
                className="mr-2 h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
              />
              <span className="text-gray-300">QR Code (Always Enabled)</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={sharingOptions.email}
                onChange={() => handleSharingOptionChange('email')}
                className="mr-2 h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
              />
              <span>Email</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={sharingOptions.sms}
                onChange={() => handleSharingOptionChange('sms')}
                className="mr-2 h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
              />
              <span>SMS</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={sharingOptions.print}
                onChange={() => handleSharingOptionChange('print')}
                className="mr-2 h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
              />
              <span>Print</span>
            </label>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || !eventName.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
        >
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>

        {saveStatus && (
          <p className={`text-sm text-center ${
            saveStatus.includes('successfully') ? 'text-green-400' : 
            saveStatus.includes('failed') || saveStatus.includes('Failed') ? 'text-red-400' : 'text-yellow-400'
          }`}>
            {saveStatus}
          </p>
        )}
      </div>
    </div>
  );
};

export default SetupWizard;