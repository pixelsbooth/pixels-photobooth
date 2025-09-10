import React, { useState, useRef } from 'react';
import { Smile, Heart, Star, Zap, X } from 'lucide-react';

const StickerBoard = ({ onStickersChange, currentStickers = [] }) => {
  const [stickers, setStickers] = useState(currentStickers);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [draggedSticker, setDraggedSticker] = useState(null);
  const boardRef = useRef(null);

  const availableStickers = [
    { id: 'smile', icon: Smile, color: '#FFD700', label: 'Smile' },
    { id: 'heart', icon: Heart, color: '#FF69B4', label: 'Heart' },
    { id: 'star', icon: Star, color: '#00BFFF', label: 'Star' },
    { id: 'zap', icon: Zap, color: '#FF4500', label: 'Lightning' },
  ];

  const addSticker = (stickerType) => {
    const newSticker = {
      id: Date.now(),
      type: stickerType.id,
      icon: stickerType.icon,
      color: stickerType.color,
      x: Math.random() * 200 + 50, // Random position
      y: Math.random() * 200 + 50,
      size: 40,
      rotation: 0
    };

    const updatedStickers = [...stickers, newSticker];
    setStickers(updatedStickers);
    
    if (onStickersChange) {
      onStickersChange(updatedStickers);
    }
  };

  const removeSticker = (stickerId) => {
    const updatedStickers = stickers.filter(s => s.id !== stickerId);
    setStickers(updatedStickers);
    
    if (onStickersChange) {
      onStickersChange(updatedStickers);
    }
  };

  const handleMouseDown = (e, sticker) => {
    e.preventDefault();
    setDraggedSticker(sticker);
    setSelectedSticker(sticker);
  };

  const handleMouseMove = (e) => {
    if (!draggedSticker || !boardRef.current) return;

    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 20; // Offset for center
    const y = e.clientY - rect.top - 20;

    const updatedStickers = stickers.map(s => 
      s.id === draggedSticker.id 
        ? { ...s, x: Math.max(0, Math.min(x, rect.width - 40)), y: Math.max(0, Math.min(y, rect.height - 40)) }
        : s
    );

    setStickers(updatedStickers);
    
    if (onStickersChange) {
      onStickersChange(updatedStickers);
    }
  };

  const handleMouseUp = () => {
    setDraggedSticker(null);
  };

  const updateStickerProperty = (stickerId, property, value) => {
    const updatedStickers = stickers.map(s => 
      s.id === stickerId ? { ...s, [property]: value } : s
    );
    setStickers(updatedStickers);
    
    if (onStickersChange) {
      onStickersChange(updatedStickers);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg space-y-4">
      <h3 className="text-white font-medium flex items-center gap-2">
        <Smile size={20} />
        Stickers
      </h3>

      {/* Sticker Palette */}
      <div className="space-y-2">
        <label className="text-sm text-gray-300">Add Stickers</label>
        <div className="flex gap-2">
          {availableStickers.map((sticker) => {
            const IconComponent = sticker.icon;
            return (
              <button
                key={sticker.id}
                onClick={() => addSticker(sticker)}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                title={`Add ${sticker.label}`}
              >
                <IconComponent size={20} style={{ color: sticker.color }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticker Board */}
      <div className="space-y-2">
        <label className="text-sm text-gray-300">Sticker Preview</label>
        <div
          ref={boardRef}
          className="relative w-full h-64 bg-gray-900 rounded-lg border-2 border-dashed border-gray-600 overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {stickers.map((sticker) => {
            const IconComponent = sticker.icon;
            return (
              <div
                key={sticker.id}
                className={`absolute cursor-move select-none ${
                  selectedSticker?.id === sticker.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                }`}
                style={{
                  left: sticker.x,
                  top: sticker.y,
                  transform: `rotate(${sticker.rotation}deg)`,
                  zIndex: selectedSticker?.id === sticker.id ? 10 : 1
                }}
                onMouseDown={(e) => handleMouseDown(e, sticker)}
              >
                <div className="relative group">
                  <IconComponent 
                    size={sticker.size} 
                    style={{ color: sticker.color }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSticker(sticker.id);
                    }}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                  >
                    <X size={10} />
                  </button>
                </div>
              </div>
            );
          })}
          
          {stickers.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
              Click stickers above to add them here
            </div>
          )}
        </div>
      </div>

      {/* Sticker Controls */}
      {selectedSticker && (
        <div className="space-y-3 p-3 bg-gray-700 rounded-lg">
          <h4 className="text-sm text-gray-300">Selected Sticker Controls</h4>
          
          {/* Size Control */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Size</span>
              <span>{selectedSticker.size}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              value={selectedSticker.size}
              onChange={(e) => updateStickerProperty(selectedSticker.id, 'size', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Rotation Control */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Rotation</span>
              <span>{selectedSticker.rotation}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={selectedSticker.rotation}
              onChange={(e) => updateStickerProperty(selectedSticker.id, 'rotation', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => removeSticker(selectedSticker.id)}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-sm transition-colors"
          >
            Remove Sticker
          </button>
        </div>
      )}

      {stickers.length > 0 && (
        <div className="text-xs text-gray-400">
          {stickers.length} sticker{stickers.length !== 1 ? 's' : ''} added
        </div>
      )}
    </div>
  );
};

export default StickerBoard;