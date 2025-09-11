import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function BoothPage({ eventId }) {
  const [event, setEvent] = useState(null);
  const [settings, setSettings] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoothData = async () => {
      try {
        // 1. Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("id", eventId)
          .single();
        if (eventError) throw eventError;
        setEvent(eventData);

        // 2. Fetch gallery settings
        const { data: settingsData, error: settingsError } = await supabase
          .from("gallery_settings")
          .select("*")
          .eq("event_id", eventId)
          .single();
        if (settingsError) throw settingsError;
        setSettings(settingsData);

        // 3. Fetch media linked to this event
        const { data: mediaData, error: mediaError } = await supabase
          .from("media")
          .select("*")
          .eq("event_id", eventId)
          .order("created_at", { ascending: false });
        if (mediaError) throw mediaError;
        setMedia(mediaData || []);
      } catch (err) {
        console.error("Error loading booth data:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBoothData();
  }, [eventId]);

  if (loading) return <p className="text-center p-6">Loading booth...</p>;
  if (!event) return <p className="text-center p-6">No event found.</p>;

  return (
    <div className="p-6">
      {/* Event Header */}
      <h1
        className="text-2xl font-bold mb-4 p-3 rounded-lg text-white"
        style={{ backgroundColor: event.theme_color || "#111827" }}
      >
        {event.name || "Event Booth"}
      </h1>

      {/* Logo */}
      {event.logo_url && (
        <div className="mb-6">
          <img
            src={event.logo_url}
            alt="Event Logo"
            className="h-20 object-contain mx-auto"
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          className="px-4 py-2 rounded-lg shadow text-white"
          style={{ backgroundColor: event.theme_color || "#111827" }}
        >
          📸 Take Photo
        </button>
        <button
          className="px-4 py-2 rounded-lg shadow text-white"
          style={{ backgroundColor: event.theme_color || "#111827" }}
        >
          🎥 Record Video
        </button>
        {event.show_countdown && (
          <button className="px-4 py-2 rounded-lg bg-gray-200 shadow">
            ⏱ Start Countdown
          </button>
        )}
      </div>

      {/* Recent Media */}
      <h2 className="text-xl font-semibold mb-4">Recent Captures</h2>
      <div
        className={`grid gap-4 ${
          settings?.layout === "grid"
            ? "grid-cols-3"
            : "grid-cols-2 md:grid-cols-4"
        }`}
      >
        {media.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            No media captured yet.
          </p>
        )}

        {media.map((item) => (
          <div
            key={item.id}
            className="relative rounded-lg overflow-hidden shadow"
          >
            {item.type === "photo" ? (
              <img
                src={item.file_url}
                alt="Captured"
                className="w-full h-48 object-cover"
              />
            ) : (
              <video
                src={item.file_url}
                controls
                className="w-full h-48 object-cover"
              />
            )}

            {/* Watermark */}
            {event.watermark_url && (
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
                  backgroundColor: event.theme_color || "#111827",
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
