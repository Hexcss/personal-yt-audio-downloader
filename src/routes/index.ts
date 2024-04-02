import { Router } from "express";
import ytdlRoutes from "./ytdl.mp3";
import axios from "axios";

const router = Router();

router.use("/ytdl", ytdlRoutes);

router.get("/download", async (req, res) => {
  const fileUrl = Array.isArray(req.query.fileUrl) ? req.query.fileUrl[0] : req.query.fileUrl;

  if (typeof fileUrl !== 'string' || !fileUrl.startsWith("http")) {
    return res.status(400).send("Invalid or missing file URL.");
  }

  try {
    const response = await axios({
      url: fileUrl,
      method: "GET",
      responseType: "stream",
    });

    const filename = fileUrl.split("/uploads/")[1]; 

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    response.data.pipe(res);
  } catch (error) {
    console.error("Error downloading the file:", error);
    res.status(500).send("Error downloading the file");
  }
});

export default router;
