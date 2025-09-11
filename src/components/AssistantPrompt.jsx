import React, { useEffect, useState } from 'react';

const AssistantPrompt = ({ message }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    if (message) {
      setCurrentMessage(message);
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000); // Message disappears after 3 seconds
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setCurrentMessage('');
    }
  }, [message]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg text-sm z-50 animate-fade-in-out">
      {currentMessage}
    </div>
  );
};

export default AssistantPrompt;