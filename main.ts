import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  const url = new URL(req.url);
  const videoUrl = url.searchParams.get("url");

  if (!videoUrl) {
    return new Response(JSON.stringify({ error: "URL required" }), { status: 400 });
  }

  // Extract video ID
  const match = videoUrl.match(/(?:v=|youtu\.be\/)([^&]+)/);
  const videoId = match ? match[1] : null;

  if (!videoId) {
    return new Response(JSON.stringify({ error: "Invalid YouTube URL" }), { status: 400 });
  }

  // Thumbnail options
  const thumbnails = {
    high: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    medium: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    low: `https://img.youtube.com/vi/${videoId}/default.jpg`
  };

  // Get real title (oEmbed)
  let title = "YouTube Video";
  let author = "";

  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    const data = await res.json();
    title = data.title;
    author = data.author_name;
  } catch {}

  return new Response(JSON.stringify({
    videoId,
    title,
    author,
    thumbnails,
    qualities: ["144p", "360p", "720p", "1080p"],
    audio: ["mp3", "aac"],
    note: "Download not supported on Deno"
  }), {
    headers: { "Content-Type": "application/json" }
  });
});
