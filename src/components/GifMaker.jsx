import React, { useState, useRef, useEffect } from 'react';
import { Camera, Play, Square, RotateCcw } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

const GifMaker = ({ onGifComplete, mode = 'gif' }) => {
  const [stream, setStream] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedFrames, setCapturedFrames] = useState([]);
  const [showCountdown, setShowCountdown] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewGif, setPreviewGif] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const frameInterval = useRef(null);

  const totalFrames = mode === 'gif' ? 4 : 8;
  const captureDelay = mode === 'gif' ? 800 : 200; // ms between frames

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (frameInterval.current) {
        clearInterval(frameInterval.current);
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 640, 
          height: 640,
          facingMode: 'user'
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const startCapture = () => {
    setShowCountdown(true);
  };

  const performCapture = () => {
    setShowCountdown(false);
    setIsCapturing(true);
    setCapturedFrames([]);
    setCurrentFrame(0);

    frameInterval.current = setInterval(() => {
      captureFrame();
    }, captureDelay);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = 320;
    canvas.height = 320;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frameData = canvas.toDataURL('image/jpeg', 0.8);
    
    setCapturedFrames(prev => {
      const newFrames = [...prev, frameData];
      setCurrentFrame(newFrames.length);
      
      if (newFrames.length >= totalFrames) {
        clearInterval(frameInterval.current);
        setIsCapturing(false);
        processFrames(newFrames);
      }
      
      return newFrames;
    });
  };

  const processFrames = async (frames) => {
    setIsProcessing(true);
    
    try {
      // For MVP, we'll create a simple animated preview
      // In production, you'd use a library like gif.js
      const gifBlob = await createSimpleGif(frames);
      const gifUrl = URL.createObjectURL(gifBlob);
      
      setPreviewGif(gifUrl);
      
      if (onGifComplete) {
        onGifComplete(gifBlob, gifUrl, mode);
      }
    } catch (error) {
      console.error('Error processing frames:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const createSimpleGif = async (frames) => {
    // Simplified GIF creation - in production use gif.js or similar
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 320;
    canvas.height = 320;

    // For now, return the first frame as a static image
    // This would be replaced with actual GIF generation
    const response = await fetch(frames[0]);
    return await response.blob();
  };

  const handleRetake = () => {
    setCapturedFrames([]);
    setCurrentFrame(0);
    setPreviewGif(null);
    setIsProcessing(false);
  };

  if (previewGif) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <img
            src={previewGif}
            alt="Generated GIF"
            className="rounded-lg w-80 h-80 object-cover"
          />
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={handleRetake}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <RotateCcw size={20} />
            Retake
          </button>
          <button
            onClick={() => onGifComplete && onGifComplete(null, previewGif, mode)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Play size={20} />
            Use This {mode === 'gif' ? 'GIF' : 'Boomerang'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="rounded-lg w-80 h-80 object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {isCapturing && (
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Frame {currentFrame} / {totalFrames}
          </div>
        )}
        
        {isProcessing && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p>Processing {mode === 'gif' ? 'GIF' : 'Boomerang'}...</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        {!isCapturing && !isProcessing ? (
          <button
            onClick={startCapture}
            disabled={!stream}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-full p-6 shadow-lg transition-colors flex items-center justify-center"
          >
            <Camera size={32} />
          </button>
        ) : (
          <button
            disabled
            className="bg-gray-600 text-white rounded-full p-6 shadow-lg flex items-center justify-center"
          >
            <Square size={32} />
          </button>
        )}
      </div>

      {!isCapturing && !isProcessing && (
        <p className="text-gray-400 text-sm text-center">
          Click to capture {totalFrames} quick shots for your {mode === 'gif' ? 'GIF' : 'Boomerang'}
        </p>
      )}

      {showCountdown && (
        <CountdownTimer
          initialCount={3}
          onCountdownEnd={performCapture}
        />
      )}
    </div>
  );
};

export default GifMaker;