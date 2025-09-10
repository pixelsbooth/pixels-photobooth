import React from 'react';
import { ArrowLeft, Mail, MessageSquare, Printer } from 'lucide-react';
import QRCodeDisplay from '../components/QRCodeDisplay';
import EmailModal from '../components/EmailModal';
import AssistantPrompt from '../components/AssistantPrompt';
import { supabase } from '../lib/supabaseClient';

const SharePage = ({ capturedPhoto, sharedUrl, onReturnToBooth, mediaType = 'image' }) => {
  const [showEmailModal, setShowEmailModal] = React.useState(false);
  const [isEmailLoading, setIsEmailLoading] = React.useState(false);
  const [emailStatus, setEmailStatus] = React.useState('');
  const [sharingOptions, setSharingOptions] = React.useState({ qr: true, email: false, sms: false, print: false });
  const [currentPrompt, setCurrentPrompt] = React.useState('Scan QR to share');

  React.useEffect(() => {
    const fetchSharingOptions = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('sharing_options')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          setSharingOptions(data[0].sharing_options || { qr: true, email: false, sms: false, print: false });
        }
      } catch (error) {
        console.error('Error fetching sharing options:', error);
      }
    };

    fetchSharingOptions();
  }, []);

  React.useEffect(() => {
    // Set initial prompt and clear it after 4 seconds
    const timer = setTimeout(() => {
      setCurrentPrompt(null);
    }, 4000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSendEmail = async (email, message) => {
    setIsEmailLoading(true);
    setEmailStatus('');
    setCurrentPrompt('Sending email...');

    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: `Your ${mediaType} from PixelBooth`,
          html: `
            <h2>Your ${mediaType} from PixelBooth</h2>
            ${message ? `<p>${message}</p>` : ''}
            <p>Click the link below to view and download your ${mediaType}:</p>
            <a href="${sharedUrl}" target="_blank">${sharedUrl}</a>
            <br><br>
            <p>Thanks for using PixelBooth!</p>
          `,
          mediaUrl: sharedUrl,
          mediaType: mediaType
        }
      });

      if (error) throw error;

      setEmailStatus('Email sent successfully!');
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailStatus('');
        setCurrentPrompt('Email sent successfully!');
      }, 2000);

    } catch (error) {
      console.error('Error sending email:', error);
      setEmailStatus('Failed to send email. Please try again.');
      setCurrentPrompt('Failed to send email. Please try again.');
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handlePrint = () => {
    setCurrentPrompt('Preparing to print...');
    if (mediaType === 'image') {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head><title>Print Photo</title></head>
          <body style="margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh;">
            <img src="${capturedPhoto}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      setCurrentPrompt('Print dialog opened!');
    }
  };

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
        <h1 className="text-xl font-bold">Share Your {mediaType === 'video' ? 'Video' : 'Photo'}</h1>
        <div></div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 items-center justify-center max-w-6xl mx-auto">
        <div className="flex-1 max-w-md">
          {mediaType === 'video' ? (
            <video
              src={capturedPhoto}
              controls
              autoPlay
              muted
              loop
              className="rounded-lg w-full shadow-lg"
            />
          ) : (
            <img
              src={capturedPhoto}
              alt="Captured photo"
              className="rounded-lg w-full shadow-lg"
            />
          )}
        </div>

        <div className="flex-1 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Scan to Download</h2>
          <QRCodeDisplay url={sharedUrl} />
          <p className="text-gray-400 mt-4 text-sm">
            Scan this QR code with your phone to download your {mediaType === 'video' ? 'video' : 'photo'}
          </p>
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-300 break-all">
              {sharedUrl}
            </p>
          </div>

          {/* Additional Sharing Options */}
          <div className="mt-6 space-y-3">
            {sharingOptions.email && (
              <button
                onClick={() => setShowEmailModal(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Mail size={20} />
                Email {mediaType === 'video' ? 'Video' : 'Photo'}
              </button>
            )}
            
            {sharingOptions.sms && (
              <button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare size={20} />
                Send via SMS
              </button>
            )}
            
            {sharingOptions.print && mediaType === 'image' && (
              <button
                onClick={handlePrint}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Printer size={20} />
                Print Photo
              </button>
            )}
          </div>

          {emailStatus && (
            <p className={`mt-4 text-sm ${
              emailStatus.includes('successfully') ? 'text-green-400' : 'text-red-400'
            }`}>
              {emailStatus}
            </p>
          )}
        </div>
      </div>

      <div className="text-center mt-8">
        <button
          onClick={onReturnToBooth}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
        >
          Take Another {mediaType === 'video' ? 'Video' : 'Photo'}
        </button>
      </div>

      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSendEmail={handleSendEmail}
        isLoading={isEmailLoading}
      />

      <AssistantPrompt message={currentPrompt} />
    </div>
  );
};

export default SharePage;