import React, { useState, useRef, useEffect } from 'react';
import { Video, Square, Play } from 'lucide-react';

const VideoRecorder = ({ onRecordingComplete, maxDuration = 30 }) => {
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  
  const videoRef = useRef(null);
  const previewRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 1280, 
          height: 720,
          facingMode: 'user'
        },
        audio: true
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const startRecording = () => {
    if (!stream) return;

    chunksRef.current = [];
    setRecordingTime(0);
    setIsRecording(true);

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });

    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(blob);
      setRecordedVideo({ blob, url: videoUrl });
      setShowPreview(true);
      
      if (onRecordingComplete) {
        onRecordingComplete(blob, videoUrl);
      }
    };

    mediaRecorder.start();

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        const newTime = prev + 1;
        if (newTime >= maxDuration) {
          stopRecording();
        }
        return newTime;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleRetake = () => {
    setShowPreview(false);
    setRecordedVideo(null);
    setRecordingTime(0);
    
    if (recordedVideo?.url) {
      URL.revokeObjectURL(recordedVideo.url);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showPreview && recordedVideo) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <video
            ref={previewRef}
            src={recordedVideo.url}
            controls
            className="rounded-lg max-w-full max-h-[60vh] object-cover"
          />
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={handleRetake}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Video size={20} />
            Record Again
          </button>
          <button
            onClick={() => onRecordingComplete && onRecordingComplete(recordedVideo.blob, recordedVideo.url)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Play size={20} />
            Use This Video
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
          className="rounded-lg max-w-full max-h-[60vh] object-cover"
        />
        
        {isRecording && (
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            REC {formatTime(recordingTime)} / {formatTime(maxDuration)}
          </div>
        )}
      </div>

      <div className="flex gap-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={!stream}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-full p-6 shadow-lg transition-colors flex items-center justify-center"
          >
            <Video size={32} />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-gray-800 hover:bg-gray-900 text-white rounded-full p-6 shadow-lg transition-colors flex items-center justify-center"
          >
            <Square size={32} />
          </button>
        )}
      </div>

      {!isRecording && (
        <p className="text-gray-400 text-sm text-center">
          Click the record button to start recording (max {maxDuration}s)
        </p>
      )}
    </div>
  );
};

export default VideoRecorder;