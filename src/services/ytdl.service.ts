import { Request, Response } from "express";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/firebase";
import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";

// Function to sanitize the video title for use as a filename
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

  // Use sanitized video title as filename
  const videoTitle = sanitizeFilename(info.videoDetails.title);
  const tempFileName = `${videoTitle}.mp3`;

  // Relative path to the temp directory
  const tempFolderPath = path.join(__dirname, "../temp");
  const tempFilePath = path.join(tempFolderPath, tempFileName);

  // Ensure the temp folder exists
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
    ffmpegCommand.kill('SIGKILL'); // Kill the ffmpeg process
    res.status(400).send("Conversion took too long! Select a shorter video or try again later.");
    hasSentResponse = true;
  };

  // Set up the timeout
  conversionTimer = setTimeout(stopConversionDueToTimeout, 2 * 60 * 1000); // 2 minutes

  console.log("Starting audio conversion...");
  ffmpegCommand
    .input(audioFormat.url)
    .inputFormat("webm")
    .audioCodec("libmp3lame")
    .audioBitrate('128k') // Reduced bitrate
    .addOption('-preset', 'faster') // Faster preset
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
      clearTimeout(conversionTimer); // Clear the timeout
      console.log("Conversion finished.");

      // Upload the file to Firebase Storage
      console.log("Uploading converted file to Firebase Storage...");
      const storageRef = ref(storage, tempFileName);
      const fileBytes = await fs.promises.readFile(tempFilePath);

      uploadBytes(storageRef, fileBytes)
        .then(async (snapshot) => {
          console.log("Uploaded the file to Firebase Storage successfully!");

          // Delete the temporary file
          console.log("Deleting temporary file...");
          fs.unlinkSync(tempFilePath);
          console.log("Temporary file deleted.");

          // Check if the temp directory only contains the temporary file we created
          const directoryContents = fs.readdirSync(tempFolderPath);
          if (directoryContents.length === 0) {
            console.log("Deleting temporary directory...");
            fs.rmSync(tempFolderPath, { recursive: true });
            console.log("Temporary directory deleted.");
          } else {
            console.warn(
              "Temp directory contains unexpected files. Not deleting."
            );
          }

          const downloadURL = await getDownloadURL(storageRef);
          console.log("Sending download URL to client.");
          if (!hasSentResponse) {
            res.send(downloadURL);
          }
        })
        .catch((error) => {
          console.error("Error uploading the file:", error);
          res.sendStatus(500);
        });
    })
    .on("error", (err) => {
      clearTimeout(conversionTimer); // Clear the timeout
      console.error("Error during conversion:", err);
      if (!hasSentResponse) {
        res.sendStatus(500);
    }
    })
    .save(tempFilePath);
}
