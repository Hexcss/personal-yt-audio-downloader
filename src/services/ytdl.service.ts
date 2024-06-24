import { Request, Response } from "express";
import ytdl from "@distube/ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";
import { bucket } from "../firebase";
import logger from "../utils/logger";

function sanitizeFilename(filename: string): string {
  return filename.replace(/[<>:"/\\|?*]+/g, "_");
}

export async function downloadMP3(req: Request, res: Response) {
  const url = req.body.url;

  if (
    !url ||
    (!url.includes("youtu.be/") && !url.includes("youtube.com/watch?v="))
  ) {
    logger.warn("Invalid YouTube URL provided.");
    return res.status(400).send("Invalid YouTube URL provided.");
  }

  logger.info("Fetching video information...");
  let info;
  try {
    info = await ytdl.getInfo(url);
  } catch (error) {
    logger.error("Failed to fetch video information:", error);
    return res.status(500).send("Failed to fetch video information.");
  }
  logger.info("Video information fetched successfully.");

  const audioFormat = ytdl.chooseFormat(info.formats, {
    quality: "highestaudio",
    filter: "audioonly",
  });

  if (!audioFormat) {
    logger.warn("No suitable audio format found.");
    return res.status(400).send("No suitable audio format found.");
  }

  const videoTitle = sanitizeFilename(info.videoDetails.title);
  const tempFileName = `${videoTitle}.mp3`;

  const tempFolderPath = path.join(__dirname, "../temp");
  const tempFilePath = path.join(tempFolderPath, tempFileName);

  if (!fs.existsSync(tempFolderPath)) {
    logger.info("Creating temp directory...");
    fs.mkdirSync(tempFolderPath);
    logger.info("Temp directory created.");
  }

  let conversionTimer: NodeJS.Timeout;
  let ffmpegCommand = ffmpeg();
  let hasSentResponse = false;

  const stopConversionDueToTimeout = () => {
    logger.warn("Conversion is taking too long. Stopping process.");
    ffmpegCommand.kill("SIGKILL");
    res
      .status(400)
      .send(
        "Conversion took too long! Select a shorter video or try again later."
      );
    hasSentResponse = true;
  };

  conversionTimer = setTimeout(stopConversionDueToTimeout, 2 * 60 * 1000);

  logger.info("Starting audio conversion...");
  ffmpegCommand
    .input(audioFormat.url)
    .inputFormat("webm")
    .audioCodec("libmp3lame")
    .audioBitrate("128k")
    .addOption("-preset", "faster")
    .toFormat("mp3")
    .on("start", (commandLine) => {
      logger.info("Spawned ffmpeg with command:", commandLine);
    })
    .on("progress", (progress) => {
      logger.info(`Processing: ${progress.percent}% done`);
    })
    .on("stderr", (stderrLine) => {
      logger.error("Stderr output:", stderrLine);
    })
    .on("end", async () => {
      clearTimeout(conversionTimer);
      logger.info("Conversion finished.");

      logger.info("Uploading converted file to Firebase Storage...");

      const uploadPath = `uploads/${tempFileName.replace(/ /g, "_")}`; 
      try {
        await bucket.upload(tempFilePath, {
          destination: uploadPath,
          metadata: {
            contentType: 'audio/mpeg',
          },
        });
        logger.info("Uploaded the file to Firebase Storage successfully!");
        fs.unlinkSync(tempFilePath);

        // Get the download URL
        const file = bucket.file(uploadPath);
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: '03-01-2025', // Set the expiration date
        });

        logger.info("Sending download URL to client.");
        if (!hasSentResponse) {
          res.send(url);
        }
      } catch (error) {
        logger.error("Error during file upload or URL generation:", error);
        if (!hasSentResponse) {
          res.sendStatus(500);
        }
      }
    })
    .on("error", (err) => {
      clearTimeout(conversionTimer);
      logger.error("Error during conversion:", err);
      if (!hasSentResponse) {
        res.sendStatus(500);
      }
    })
    .save(tempFilePath);
}
