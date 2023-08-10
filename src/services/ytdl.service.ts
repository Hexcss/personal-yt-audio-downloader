import { Request, Response } from "express";
import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";

export async function downloadMP3(req: Request, res: Response) {
  const url = req.body.url;

  // Handling both 'https://youtu.be/' and 'https://www.youtube.com/watch?v=' formats
  if (
    !url ||
    (!url.includes("youtu.be/") && !url.includes("youtube.com/watch?v="))
  ) {
    return res.status(400).send("Invalid YouTube URL provided.");
  }

  const info = await ytdl.getInfo(url);
  const audioFormat = ytdl.chooseFormat(info.formats, {
    quality: "highestaudio",
    filter: "audioonly",
  });

  if (!audioFormat) {
    return res.status(400).send("No suitable audio format found.");
  }

  res.header("Content-Disposition", 'attachment; filename="audio.mp3"');

  ffmpeg()
    .input(audioFormat.url)
    .inputFormat("webm") // Explicitly set input format
    .audioCodec("libmp3lame")
    .toFormat("mp3")
    .on("end", () => {
      console.log("Conversion finished.");
    })
    .on("error", (err) => {
      console.error("Error:", err);
      res.sendStatus(500);
    })
    .pipe(res, { end: true });
}