import * as admin from "firebase-admin";
import { Request, Response } from "express";
import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";

function sanitizeFilename(filename: string): string {
  return filename.replace(/[<>:"/\\|?*]+/g, "_");
}

export async function downloadMP3(req: Request, res: Response) {
  const url = req.body.url;

  if (
    !url ||
    (!url.includes("youtu.be/") && !url.includes("youtube.com/watch?v="))
  ) {
    console.log("Invalid YouTube URL provided.");
    return res.status(400).send("Invalid YouTube URL provided.");
  }

  console.log("Fetching video information...");
  const info = await ytdl.getInfo(url);
  console.log("Video information fetched successfully.");

  const audioFormat = ytdl.chooseFormat(info.formats, {
    quality: "highestaudio",
    filter: "audioonly",
  });

  if (!audioFormat) {
    console.log("No suitable audio format found.");
    return res.status(400).send("No suitable audio format found.");
  }

  const videoTitle = sanitizeFilename(info.videoDetails.title);
  const tempFileName = `${videoTitle}.mp3`;

  const tempFolderPath = path.join(__dirname, "../temp");
  const tempFilePath = path.join(tempFolderPath, tempFileName);

  if (!fs.existsSync(tempFolderPath)) {
    console.log("Creating temp directory...");
    fs.mkdirSync(tempFolderPath);
    console.log("Temp directory created.");
  }

  let conversionTimer: NodeJS.Timeout;
  let ffmpegCommand = ffmpeg();
  let hasSentResponse = false;

  const stopConversionDueToTimeout = () => {
    console.warn("Conversion is taking too long. Stopping process.");
    ffmpegCommand.kill("SIGKILL");
    res
      .status(400)
      .send(
        "Conversion took too long! Select a shorter video or try again later."
      );
    hasSentResponse = true;
  };

  conversionTimer = setTimeout(stopConversionDueToTimeout, 2 * 60 * 1000); // 2 minutes

  console.log("Starting audio conversion...");
  ffmpegCommand
    .input(audioFormat.url)
    .inputFormat("webm")
    .audioCodec("libmp3lame")
    .audioBitrate("128k")
    .addOption("-preset", "faster")
    .toFormat("mp3")
    .on("start", (commandLine) => {
      console.log("Spawned ffmpeg with command:", commandLine);
    })
    .on("progress", (progress) => {
      console.log(`Processing: ${progress.percent}% done`);
    })
    .on("stderr", (stderrLine) => {
      console.error("Stderr output:", stderrLine);
    })
    .on("end", async () => {
      clearTimeout(conversionTimer);
      console.log("Conversion finished.");

      console.log("Uploading converted file to Firebase Storage...");

      const bucket = admin.storage().bucket();
      const tempFilePath = path.join(tempFolderPath, tempFileName);
      const uploadPath = `uploads/${tempFileName}`; // Modify as needed

      bucket
        .upload(tempFilePath, {
          destination: uploadPath,
        })
        .then(async (data) => {
          const file = data[0];
          console.log("Uploaded the file to Firebase Storage successfully!");

          fs.unlinkSync(tempFilePath);

          const downloadURL = await file.getSignedUrl({
            action: "read",
            expires: "03-09-2491",
          });

          console.log("Sending download URL to client.");
          if (!hasSentResponse) {
            res.send(downloadURL[0]); 
          }
        })
        .catch((error) => {
          console.error("Error uploading the file:", error);
          res.sendStatus(500);
        });
    })
    .on("error", (err) => {
      clearTimeout(conversionTimer);
      console.error("Error during conversion:", err);
      if (!hasSentResponse) {
        res.sendStatus(500);
      }
    })
    .save(tempFilePath);
}
