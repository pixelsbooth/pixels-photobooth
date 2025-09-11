import React from "react";

const MediaCard = ({ media }) => {
  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden shadow-md">
      {media.type === "photo" ? (
        <img
          src={media.file_url}
          alt="Captured"
          className="w-full h-48 object-cover"
        />
      ) : (
        <video
          src={media.file_url}
          controls
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-2 text-xs text-gray-400">
        {new Date(media.created_at).toLocaleString()}
      </div>
    </div>
  );
};

export default MediaCard;
