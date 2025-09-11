import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function GalleryPage({ eventId }) {
  const [media, setMedia] = useState([]);
  const [settings, setSettings] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        // 1. Fetch gallery settings
        const { data: settingsData, error: settingsError } = await supabase
          .from("gallery_settings")
          .select("*")
          .eq("event_id", eventId)
          .single();
        if (settingsError) throw settingsError;
        setSettings(settingsData);

        // 2. Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("name, theme_color, watermark_url")
          .eq("id", eventId)
          .single();
        if (eventError) throw eventError;
        setEvent(eventData);

        // 3. Fetch media for this event
        const { data: mediaData, error: mediaError } = await supabase
          .from("media")
          .select("*")
          .eq("event_id", eventId)
          .order("created_at", { ascending: false });
        if (mediaError) throw mediaError;
        setMedia(mediaData || []);
      } catch (err) {
        console.error("Error fetching gallery:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [eventId]);

  if (loading) {
    return <p className="text-center text-gray-400 mt-10">Loading gallery...</p>;
  }

  if (!settings) {
    return (
      <p className="text-center text-gray-400 mt-10">
        No gallery settings found for this event.
      </p>
    );
  }

  if (media.length === 0) {
    return (
      <p className="text-center text-gray-400 mt-10">
        No media found for this event.
      </p>
    );
  }

  return (
    <div className="p-6">
      {/* Event Title */}
      <h2
        className="text-2xl font-bold mb-6 p-3 rounded-lg text-white"
        style={{ backgroundColor: event?.theme_color || "#111827" }}
      >
        {event?.name || "Gallery"}
      </h2>

      <div
        className={`grid gap-4 ${
          settings.layout === "grid"
            ? "grid-cols-3"
            : "grid-cols-2 md:grid-cols-4"
        }`}
      >
        {media.map((item) => (
          <div
            key={item.id}
            className="relative bg-gray-900 rounded-lg overflow-hidden shadow"
          >
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
            {settings.allow_downloads && (
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
        ))}
      </div>
    </div>
  );
}
