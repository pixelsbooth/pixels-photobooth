import React from "react";

export default function MediaCard({ item, event, settings }) {
  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden shadow">
      {item.type === "photo" ? (
        <img
          src={item.file_url}
          alt={item.filename || "Captured"}
          className="w-full h-48 object-cover"
        />
      ) : (
        <video
          src={item.file_url}
          controls
          className="w-full h-48 object-cover"
        />
      )}

      {/* Watermark overlay */}
      {event?.watermark_url && (
        <img
          src={event.watermark_url}
          alt="Watermark"
          className="absolute bottom-2 right-2 w-16 opacity-70"
        />
      )}

      {/* Download button */}
      {settings?.allow_downloads && (
        <a
          href={item.file_url}
          download
          className="absolute top-2 right-2 px-2 py-1 text-xs rounded shadow"
          style={{
            backgroundColor: event?.theme_color || "#111827",
            color: "white",
          }}
        >
          Download
        </a>
      )}

      {/* Timestamp */}
      <div className="p-2 text-xs text-gray-400">
        {new Date(item.created_at).toLocaleString()}
      </div>
    </div>
  );
}
