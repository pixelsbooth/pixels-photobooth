import React, { useState, useRef, useEffect } from "react";
import { Camera, Video, Image, Gift, Palette, Smile, GalleryHorizontal, X } from "lucide-react";
import PreviewModal from "../components/PreviewModal";
import CountdownTimer from "../components/CountdownTimer";
import VideoRecorder from "../components/VideoRecorder";
import AssistantPrompt from "../components/AssistantPrompt";
import GifMaker from "../components/GifMaker";
import FilterControls from "../components/FilterControls";
import StickerBoard from "../components/StickerBoard";
import { applyOverlay } from "../utils/canvasUtils";
import { supabase } from "../lib/supabaseClient";

const BoothPage = ({ onNavigateToShare, onNavigateToSetup, onNavigateToGallery, eventId, eventDetails }) => {
  const [mode, setMode] = useState("photo"); // 'photo', 'video', 'gif', 'boomerang'
  const [stream, setStream] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState(null); // Can be image data URL or video URL
  const [capturedMediaType, setCapturedMediaType] = useState('photo');
  const [showCountdown, setShowCountdown] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("Tap Start to begin");
  const [showFilterControls, setShowFilterControls] = useState(false);
  const [showStickerBoard, setShowStickerBoard] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [appliedStickers, setAppliedStickers] = useState([]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (mode === "photo" || mode === "gif" || mode === "boomerang") {
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
    } else if (mode === "video") {
      setCurrentPrompt("Tap the record button to start!");
    } else if (mode === "gif" || mode === "boomerang") {
      setCurrentPrompt(`Tap the GIF button to capture your ${mode}!`);
    }
  }, [mode, stream, showCountdown, showPreview, isUploading]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
        audio: false // Only video for photo/gif modes
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
    setCapturedMedia(imageData);
    setCapturedMediaType('photo');
    setShowPreview(true);
    setShowCountdown(false);
    setCurrentPrompt("Photo captured!");

    setTimeout(() => setCurrentPrompt(null), 2000);
  };

  const handleRetake = () => {
    setShowPreview(false);
    setCapturedMedia(null);
    setCapturedMediaType('photo');
    setAppliedFilters({});
    setAppliedStickers([]);
    setCurrentPrompt("Tap the camera button to start!");
  };

  const handleShare = async () => {
    if (!capturedMedia) return;

    setIsUploading(true);
    setCurrentPrompt("Uploading your media...");
    try {
      let finalMediaData = capturedMedia;
      let fileType = 'image/jpeg';
      let fileNameExtension = 'jpg';

      if (capturedMediaType === 'photo') {
        // Apply filters and stickers to the photo
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        const img = new Image();
        img.src = capturedMedia;
        await new Promise(resolve => img.onload = resolve);

        tempCanvas.width = img.width;
        tempCanvas.height = img.height;

        // Apply filters first
        const filterCSS = Object.keys(appliedFilters)
          .map(key => {
            if (key === 'blur') return `blur(${appliedFilters[key]}px)`;
            if (key === 'sepia' || key === 'grayscale') return `${key}(${appliedFilters[key]}%)`;
            return `${key}(${appliedFilters[key]}%)`;
          })
          .join(' ');
        tempCtx.filter = filterCSS;
        tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.filter = 'none'; // Reset filter for next draws

        // Apply stickers
        for (const sticker of appliedStickers) {
          // For simplicity, we'll draw colored rectangles as placeholder for stickers
          tempCtx.save();
          tempCtx.translate(sticker.x + sticker.size / 2, sticker.y + sticker.size / 2);
          tempCtx.rotate(sticker.rotation * Math.PI / 180);
          tempCtx.fillStyle = sticker.color;
          tempCtx.fillRect(-sticker.size / 2, -sticker.size / 2, sticker.size, sticker.size);
          tempCtx.restore();
        }

        finalMediaData = tempCanvas.toDataURL("image/jpeg", 0.9);

        // Apply overlay (logo, event name, timestamp)
        finalMediaData = await applyOverlay(finalMediaData, eventDetails?.logo_url, eventDetails?.name);
      } else if (capturedMediaType === 'video') {
        fileType = 'video/webm';
        fileNameExtension = 'webm';
      } else if (capturedMediaType === 'gif' || capturedMediaType === 'boomerang') {
        fileType = 'image/gif';
        fileNameExtension = 'gif';
      }

      const response = await fetch(finalMediaData);
      const blob = await response.blob();

      const fileName = `${capturedMediaType}-${Date.now()}.${fileNameExtension}`;
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("media")
        .getPublicUrl(fileName);

      await supabase.from("media").insert({
        event_id: eventId,
        file_url: urlData.publicUrl,
        type: capturedMediaType,
        filters: appliedFilters,
        stickers: appliedStickers,
        created_at: new Date().toISOString(),
      });

      onNavigateToShare(finalMediaData, urlData.publicUrl, capturedMediaType);
    } catch (error) {
      console.error("Error sharing media:", error);
      setCurrentPrompt("Failed to share media. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleVideoRecorded = async (videoBlob, videoUrl) => {
    setCapturedMedia(videoUrl);
    setCapturedMediaType('video');
    setShowPreview(true);
    setCurrentPrompt("Video recorded!");
    setTimeout(() => setCurrentPrompt(null), 2000);
  };

  const handleGifComplete = async (gifBlob, gifUrl, type) => {
    setCapturedMedia(gifUrl);
    setCapturedMediaType(type);
    setShowPreview(true);
    setCurrentPrompt(`${type} created!`);
    setTimeout(() => setCurrentPrompt(null), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative">
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">PixelBooth Pro</h1>
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
            <button
              onClick={() => setMode("gif")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                mode === "gif"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Gift size={16} />
              GIF
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onNavigateToGallery}
            className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
          >
            <GalleryHorizontal size={16} /> Gallery
          </button>
          <button
            onClick={onNavigateToSetup}
            className="text-sm text-gray-400 hover:text-white"
          >
            Setup
          </button>
        </div>
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
              style={{
                filter: Object.keys(appliedFilters)
                  .map(key => {
                    if (key === 'blur') return `blur(${appliedFilters[key]}px)`;
                    if (key === 'sepia' || key === 'grayscale') return `${key}(${appliedFilters[key]}%)`;
                    return `${key}(${appliedFilters[key]}%)`;
                  })
                  .join(' ')
              }}
            />
            <canvas ref={canvasRef} className="hidden" />
            {/* Render stickers directly on video feed for live preview */}
            {appliedStickers.map(sticker => {
              const IconComponent = sticker.icon;
              return (
                <div
                  key={sticker.id}
                  className="absolute select-none"
                  style={{
                    left: sticker.x,
                    top: sticker.y,
                    transform: `rotate(${sticker.rotation}deg)`,
                  }}
                >
                  <IconComponent size={sticker.size} style={{ color: sticker.color }} />
                </div>
              );
            })}
          </div>
        ) : mode === "video" ? (
          <VideoRecorder
            onRecordingComplete={handleVideoRecorded}
            maxDuration={30}
          />
        ) : ( // GIF or Boomerang mode
          <GifMaker
            onGifComplete={handleGifComplete}
            mode={mode}
          />
        )}
      </div>

      {/* Controls for Photo Mode */}
      {mode === "photo" && (
        <div className="p-6 flex justify-center items-center gap-4">
          <button
            onClick={() => setShowFilterControls(!showFilterControls)}
            className={`bg-gray-700 hover:bg-gray-600 text-white rounded-full p-4 shadow-lg transition-colors ${showFilterControls ? 'bg-blue-600' : ''}`}
            title="Adjust Filters"
          >
            <Palette size={24} />
          </button>
          <button
            onClick={() => setShowStickerBoard(!showStickerBoard)}
            className={`bg-gray-700 hover:bg-gray-600 text-white rounded-full p-4 shadow-lg transition-colors ${showStickerBoard ? 'bg-blue-600' : ''}`}
            title="Add Stickers"
          >
            <Smile size={24} />
          </button>
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
          image={capturedMedia}
          mediaType={capturedMediaType}
          onRetake={handleRetake}
          onShare={handleShare}
          isUploading={isUploading}
        />
      )}

      {showFilterControls && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full relative">
            <button
              onClick={() => setShowFilterControls(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            <FilterControls onFilterChange={setAppliedFilters} currentFilters={appliedFilters} />
          </div>
        </div>
      )}

      {showStickerBoard && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full relative">
            <button
              onClick={() => setShowStickerBoard(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            <StickerBoard onStickersChange={setAppliedStickers} currentStickers={appliedStickers} />
          </div>
        </div>
      )}

      <AssistantPrompt message={currentPrompt} />
    </div>
  );
};

export default BoothPage;