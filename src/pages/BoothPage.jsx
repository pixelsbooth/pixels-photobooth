import React, { useState, useRef, useEffect } from "react";
import { Camera, Video, Image } from "lucide-react";
import PreviewModal from "../components/PreviewModal";
import CountdownTimer from "../components/CountdownTimer";
import VideoRecorder from "../components/VideoRecorder";
import AssistantPrompt from "../components/AssistantPrompt";
import { applyOverlay } from "../utils/canvasUtils";
import { supabase } from "../lib/supabaseClient";

const BoothPage = ({ onNavigateToShare, onNavigateToSetup, eventId }) => {
  const [mode, setMode] = useState("photo");
  const [stream, setStream] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("Tap Start to begin");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (mode === "photo") {
      startCamera();
    } else {
      setCurrentPrompt("Tap the record button to start!");
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mode]);

  useEffect(() => {
    if (mode === "photo") {
      if (!stream) {
        setCurrentPrompt("Waiting for camera...");
      } else if (!showCountdown && !showPreview && !isUploading) {
        setCurrentPrompt("Tap the camera button to start!");
      } else if (isUploading) {
        setCurrentPrompt("Uploading your photo...");
      } else if (showPreview) {
        setCurrentPrompt(null);
      }
    }
  }, [mode, stream, showCountdown, showPreview, isUploading]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCurrentPrompt("Camera access denied. Please enable permissions.");
    }
  };

  const capturePhoto = () => {
    setShowCountdown(true);
    setCurrentPrompt(null);
  };

  const performPhotoCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(imageData);
    setShowPreview(true);
    setShowCountdown(false);
    setCurrentPrompt("Photo captured!");

    setTimeout(() => setCurrentPrompt(null), 2000);
  };

  const handleRetake = () => {
    setShowPreview(false);
    setCapturedImage(null);
    setCurrentPrompt("Tap the camera button to start!");
  };

  const handleShare = async () => {
    if (!capturedImage) return;

    setIsUploading(true);
    try {
      const overlayedImage = await applyOverlay(capturedImage);

      const response = await fetch(overlayedImage);
      const blob = await response.blob();

      const fileName = `photo-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("media")
        .getPublicUrl(fileName);

      await supabase.from("media").insert({
        event_id: eventId,
        file_url: urlData.publicUrl, // ✅ renamed to match MediaCard
        type: "photo",
        created_at: new Date().toISOString(),
      });

      onNavigateToShare(overlayedImage, urlData.publicUrl);
    } catch (error) {
      console.error("Error sharing photo:", error);
      setCurrentPrompt("Failed to share photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleVideoRecorded = async (videoBlob, videoUrl) => {
    setIsUploading(true);
    setCurrentPrompt("Uploading your video...");
    try {
      const fileName = `video-${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(fileName, videoBlob);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("media")
        .getPublicUrl(fileName);

      await supabase.from("media").insert({
        event_id: eventId,
        file_url: urlData.publicUrl, // ✅ renamed to match MediaCard
        type: "video",
        created_at: new Date().toISOString(),
      });

      onNavigateToShare(videoUrl, urlData.publicUrl);
    } catch (error) {
      console.error("Error sharing video:", error);
      setCurrentPrompt("Failed to share video. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative">
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">PixelBooth Lite</h1>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setMode("photo")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                mode === "photo"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Image size={16} />
              Photo
            </button>
            <button
              onClick={() => setMode("video")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                mode === "video"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Video size={16} />
              Video
            </button>
          </div>
        </div>
        <button
          onClick={onNavigateToSetup}
          className="text-sm text-gray-400 hover:text-white"
        >
          Setup
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        {mode === "photo" ? (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="rounded-lg max-w-full max-h-[60vh] object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
        ) : (
          <VideoRecorder
            onRecordingComplete={handleVideoRecorded}
            maxDuration={30}
          />
        )}
      </div>

      {mode === "photo" && (
        <div className="p-6 flex justify-center">
          <button
            onClick={capturePhoto}
            disabled={!stream || isUploading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-full p-6 shadow-lg transition-colors"
          >
            <Camera size={32} />
          </button>
        </div>
      )}

      {showCountdown && (
        <CountdownTimer initialCount={3} onCountdownEnd={performPhotoCapture} />
      )}

      {showPreview && (
        <PreviewModal
          image={capturedImage}
          onRetake={handleRetake}
          onShare={handleShare}
          isUploading={isUploading}
        />
      )}

      <AssistantPrompt message={currentPrompt} />
    </div>
  );
};

export default BoothPage;
