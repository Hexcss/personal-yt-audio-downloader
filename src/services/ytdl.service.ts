import { Request, Response } from "express";
import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";

export async function downloadMP3(req: Request, res: Response) {
  const url = req.body.url;

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

  let ffmpegErrorOccurred = false;

  ffmpeg()
    .input(audioFormat.url)
    .inputFormat("webm")
    .audioCodec("libmp3lame")
    .toFormat("mp3")
    .on("end", () => {
      console.log("Conversion finished.");
    })
    .on("error", (err) => {
      console.error("Error:", err);
      ffmpegErrorOccurred = true;
    })
    .on("close", () => {
      // Handle the error after the stream is closed
      if (ffmpegErrorOccurred && !res.writableEnded) {
        res.sendStatus(500);
      }
    })
    .pipe(res, { end: true });
}
