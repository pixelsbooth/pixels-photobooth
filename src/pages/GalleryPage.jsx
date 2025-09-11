import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function GalleryPage({ eventId }) {
  const [media, setMedia] = useState([]);
  const [settings, setSettings] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        // 1. Fetch event settings
        const { data: galleryData, error: galleryError } = await supabase
          .from("gallery_settings")
          .select("*")
          .eq("event_id", eventId)
          .single();
        if (galleryError) throw galleryError;
        setSettings(galleryData);

        // 2. Fetch event details (theme + watermark)
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("theme_color, watermark_url")
          .eq("id", eventId)
          .single();
        if (eventError) throw eventError;
        setEvent(eventData);

        // 3. Fetch media
        const { data: mediaData, error: mediaError } = await supabase
          .from("media")
          .select("*")
          .eq("event_id", eventId)
          .order("created_at", { ascending: false });
        if (mediaError) throw mediaError;
        setMedia(mediaData || []);
      } catch (err) {
        console.error("Error loading gallery:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [eventId]);

  if (loading) return <p className="text-center p-6">Loading gallery...</p>;
  if (!settings) return <p className="text-center p-6">No gallery settings found for this event.</p>;

  return (
    <div className="p-6">
      {/* Header with theme color */}
      <h1
        className="text-2xl font-bold mb-6 p-3 rounded-lg text-white"
        style={{ backgroundColor: event?.theme_color || "#111827" }}
      >
        Event Gallery
      </h1>

      <div
        className={`grid gap-4 ${
          settings.layout === "grid"
            ? "grid-cols-3"
            : "grid-cols-2 md:grid-cols-4"
        }`}
      >
        {media.map((item) => (
          <div key={item.id} className="relative rounded-lg overflow-hidden shadow">
            <img
              src={item.file_url}
              alt={item.type}
              className="w-full h-48 object-cover"
            />

            {/* Watermark overlay */}
            {event?.watermark_url && (
              <img
                src={event.watermark_url}
                alt="Watermark"
                className="absolute bottom-2 right-2 w-16 opacity-70"
              />
            )}

            {/* Download button if allowed */}
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
          </div>
        ))}
      </div>
    </div>
  );
}