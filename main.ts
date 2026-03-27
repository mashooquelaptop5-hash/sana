import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  const url = new URL(req.url);

  // HTML
  if (url.pathname === "/") {
    return new Response(`
      <html>
      <body style="font-family: Arial; text-align:center; padding:40px;">
        <h2>YouTube Tool</h2>

        <input id="url" placeholder="Paste YouTube URL" style="width:60%;padding:10px;">
        <br><br>
        <button onclick="fetchData()">Fetch</button>

        <div id="result"></div>

        <script>
        async function fetchData() {
          const input = document.getElementById("url").value;
          const res = await fetch('/api?url=' + input);
          const data = await res.json();

          document.getElementById("result").innerHTML =
            "<h3>" + data.title + "</h3>" +
            "<p>" + data.author + "</p>" +
            "<img src='" + data.thumbnail + "' width='300'><br><br>" +
            data.qualities.map(q => "<button>"+q+"</button>").join("") +
            "<br><br><button>MP3</button>";
        }
        </script>

      </body>
      </html>
    `, {
      headers: { "content-type": "text/html" },
    });
  }

  // API
  if (url.pathname === "/api") {
    const videoUrl = url.searchParams.get("url");

    if (!videoUrl) {
      return new Response(JSON.stringify({ error: "URL required" }), { status: 400 });
    }

    const match = videoUrl.match(/(?:v=|youtu\.be\/)([^&]+)/);
    const videoId = match ? match[1] : null;

    if (!videoId) {
      return new Response(JSON.stringify({ error: "Invalid URL" }), { status: 400 });
    }

    let title = "YouTube Video";
    let author = "";

    try {
      const res = await fetch(
        "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=" + videoId + "&format=json"
      );
      const data = await res.json();
      title = data.title;
      author = data.author_name;
    } catch {}

    return new Response(JSON.stringify({
      title,
      author,
      thumbnail: "https://img.youtube.com/vi/" + videoId + "/hqdefault.jpg",
      qualities: ["144p","360p","720p","1080p"]
    }), {
      headers: { "content-type": "application/json" },
    });
  }

  return new Response("Not Found", { status: 404 });
});
